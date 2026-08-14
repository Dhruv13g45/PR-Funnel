import { generateEmbeddings } from "../../services/embedding.services.js";
import {
  getPullRequestFiles,
  getRepositoryFile,
  filterRelevantFiles,
} from "../../services/githubApp.services.js";
import { markPullRequestProcessing } from "../../services/pullRequest.services.js";
import { chunkCode } from "../../utils/chunkCode.js";
import { inngestClient } from "../client.js";

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

    await step.run("Log the files", async () => {
      console.log(files);
    });

    const fileContents = await step.run("Fetch PR File Contents", async () => {
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

    await step.run("Log the file contents", async () => {
      console.log(fileContents);
    });

    const relevantFiles = await step.run("Filter relevant files", async () => {
      return filterRelevantFiles(fileContents);
    });

    await step.run("Log the relevant files", async () => {
      console.log(relevantFiles);
    });

    const chunks = await step.run("Chunk Code", async () => {
      return chunkCode(fileContents);
    });

    await step.run("Log the chunks", async () => {
      console.log(chunks);
    });

    const embeddings = await step.run("Generate Embeddings", async () => {
      return generateEmbeddings(chunks[0]?.content || "");
    });

    await step.run("Log the embeddings", async () => {
      console.log("Embedding length", embeddings.length);
      console.log("First ten lines of the embedding", embeddings.slice(0, 10));
    });
  },
);
