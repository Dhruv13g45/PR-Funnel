import { generateEmbeddings } from "../../services/embedding.services.js";
import {
  filterRelevantFiles,
  getRepositoryCodebase,
  getRepositoryFile,
  getRepositoryTree,
} from "../../services/githubApp.services.js";
import {
  filterRepositoryFiles,
  indexRespositoryCode,
  markRepoSync,
  markRepoSynced,
  markRepoSyncFailed,
} from "../../services/repository.services.js";
import { storeCodeChunk } from "../../services/vector.services.js";
import { chunkCode } from "../../utils/chunkCode.js";
import { inngestClient } from "../client.js";

export const repoSyncPipeline = inngestClient.createFunction(
  {
    id: "repo-sync-pipeline",

    triggers: [
      {
        event: "pr/repoSync.requested",
      },
    ],
  },

  async ({ event, step }) => {
    const { installationId, owner, repo } = event?.data;

    const branch = "main";

    const repositoryTree = await step.run("Fetch Repository Tree", async () => {
      return getRepositoryTree(installationId, owner, repo, branch);
    });

    const relevantFiles = await step.run(
      "Filter Relevant Repository Files",
      async () => {
        return filterRepositoryFiles(repositoryTree.tree);
      },
    );

    const fileContents = await step.run(
      "Fetch Relevant File Contents",
      async () => {
        const results = [];

        for (const file of relevantFiles) {
          const content = await getRepositoryFile(
            installationId,
            owner,
            repo,
            file.path,
            branch,
          );

          results.push(content);
        }

        return results;
      },
    );

    const chunks = await step.run("Chunk Repository Code", async () => {
      const result = chunkCode(fileContents);

      if (!result.length) {
        throw new Error("No repository code chunks were generated");
      }

      return result;
    });

    await step.run("Generate and store repository embeddings", async () => {
      for (const [index, chunk] of chunks.entries()) {
        const embedding = await generateEmbeddings(chunk.content);

        const vectorId = `${owner}/${repo}:main:${chunk.path}:${index}`;

        await storeCodeChunk(vectorId, embedding, {
          repository: `${owner}/${repo}`,
          filePath: chunk.path,
          content: chunk.content,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          sourceType: "repository",
        });
      }

      return {
        chunkCount: chunks.length,
      };
    });

    await step.run("Mark Repository as Syncing", async () => {
      return markRepoSync(installationId, `${owner}/${repo}`, branch);
    });

    const chunkCount = await step.run("Index Repository Code", async () => {
      const repository = `${owner}/${repo}`;

      return indexRespositoryCode(fileContents, repository);
    });

    try {
      await step.run("Mark Repository as Synced", async () => {
        return markRepoSynced(`${owner}/${repo}`, chunkCount);
      });
    } catch (error) {
      await markRepoSyncFailed(`${owner}/${repo}`);
      throw error;
    }
  },
);
