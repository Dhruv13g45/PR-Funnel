import {
  getPullRequestFiles,
  getRepositoryFile,
} from "../../services/githubApp.services.js";
import { markPullRequestProcessing } from "../../services/pullRequest.services.js";
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
  },
);
