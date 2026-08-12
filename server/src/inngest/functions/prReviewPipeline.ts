import filterRelevantFiles, {
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

    const relevantFiles = await step.run("Filter relevant files", async () => {
      return filterRelevantFiles(files as unknown as []);
    });

    await step.run("Log the relevent files", async () => {
      console.log(relevantFiles);
    });

    const fileContents = await step.run("Fetch PR File Contents", async () => {
      const results = [];

      // @ts-ignore
      const { installationId, owner, repo, headSha } = event?.data;
      for (const file of relevantFiles as any[]) {
        if ((file as any)?.status === "removed") {
          console.log(`Skipping deleted file: ${file?.filename}`);
          continue;
        }

        const content = await getRepositoryFile(
          installationId,
          owner,
          repo,
          file?.filename,
          headSha,
        );

        results.push(content);
      }

      return results;
    });

    await step.run("Logging the file contents", () => {
      console.log(fileContents);
    });
  },
);
