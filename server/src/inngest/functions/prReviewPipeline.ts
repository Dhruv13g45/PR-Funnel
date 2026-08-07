import { getPullRequestFiles } from "../../services/githubApp.services.js";
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

    return {
      success: true,
    };
  },
);
