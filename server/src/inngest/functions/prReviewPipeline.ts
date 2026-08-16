import { generateEmbeddings } from "../../services/embedding.services.js";
import {
  getPullRequestFiles,
  getRepositoryFile,
  filterRelevantFiles,
} from "../../services/githubApp.services.js";
import { markPullRequestProcessing } from "../../services/pullRequest.services.js";
import { retrieveRepositoryContext } from "../../services/repository.services.js";
import {
  querySimilarCode,
  searchSimilarCode,
  storeCodeChunk,
} from "../../services/vector.services.js";
import { chunkCode } from "../../utils/chunkCode.js";
import { inngestClient } from "../client.js";
import {
  generateCodeReview,
  savePullRequestReview,
} from "../../services/aiReview.services.js";

export const prReviewPipeline = inngestClient.createFunction(
  {
    id: "pr-review-pipeline",

    triggers: [
      {
        event: "pr/review.requested",
      },
    ],
  },

  async ({ event, step }) => {
    const { reviewId } = event?.data;

    await step.run("Mark as Processing", async () => {
      await markPullRequestProcessing(reviewId);
    });

    const files = await step.run("Fetch PR Files", async () => {
      const { installationId, owner, repo, prNumber } = event?.data;
      return await getPullRequestFiles(installationId, owner, repo, prNumber);
    });

    const fileContents = await step.run("Fetch PR File Contents", async () => {
      console.log("Fetching file contents for fetch PR files:", files);
      const results = [];
      const { installationId, owner, repo, headSha } = event?.data;

      for (const file of files) {
        if (file.status === "removed") {
          console.log(`Skipping deleted file: ${file.filename}`);
          continue;
        }

        const content = await getRepositoryFile(
          installationId,
          owner,
          repo,
          file.filename,
          headSha,
        );

        results.push(content);
      }

      return results;
    });

    const relevantFiles = await step.run("Filter relevant files", async () => {
      console.log("Filtering relevant files from file contents:", fileContents);
      return filterRelevantFiles(fileContents);
    });

    await step.run("Debug relevant files", async () => {
      console.log("Relevant files count:", relevantFiles.length);
      console.dir(relevantFiles, { depth: null });
    });

    const chunks = await step.run("Chunk Code", async () => {
      const result = chunkCode(relevantFiles);

      if (!result.length) {
        throw new Error("No code chunks were generated");
      }

      return result;
    });

    await step.run("Debug chunks", async () => {
      console.log("Chunks count:", chunks.length);
      console.dir(chunks, { depth: null });
    });

    await step.run("Generate and store embeddings", async () => {
      for (const [index, chunk] of chunks.entries()) {
        const embedding = await generateEmbeddings(chunk.content);

        const vectorId = `${event.data.owner}/${event.data.repo}:${event.data.prNumber}:${chunk.path}:${index}`;

        await storeCodeChunk(vectorId, embedding, {
          repository: `${event?.data.owner}/${event?.data.repo}`,
          pullRequestNumber: event?.data.prNumber,
          filePath: chunk.path,
          content: chunk.content,
        });
      }
    });

    const relevantCode = await step.run(
      "Retrieve Repository Context",
      async () => {
        const repository = `${event.data.owner}/${event.data.repo}`;

        return retrieveRepositoryContext(chunks, repository);
      },
    );

    const aiReview = await step.run("Generate AI Code Review", async () => {
      const changedCode = chunks
        .map((chunk) => {
          return `File: ${chunk.path}\n\n${chunk.content}`;
        })
        .join("\n\n---\n\n");

      const repositoryContext = relevantCode
        .flatMap((item) => item.matches || [])
        .map((match) => match.metadata?.content)
        .filter((content): content is string => Boolean(content))
        .join("\n\n");

      const response = await generateCodeReview(changedCode, repositoryContext);
      const responseText = response ?? "{}";

      return JSON.parse(responseText);
    });

    await step.run("Log ai review", async () => {
      console.log(aiReview);
    });

    await step.run("Save AI code review", async () => {
      const { reviewId } = event?.data;
      if (!aiReview) {
        throw new Error(
          "AI review error: Could not generate AI review for the pull request",
        );
      }
      return savePullRequestReview(reviewId, JSON.stringify(aiReview));
    });
  },
);
