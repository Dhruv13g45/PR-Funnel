import { Webhooks } from "@octokit/webhooks";

export const githubWebhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

githubWebhooks.on("installation.created", async ({ payload }) => {
  console.log("Installation Created");
  console.log(payload.installation.id);
});
