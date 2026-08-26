import { Webhooks } from "@octokit/webhooks";
import { createPullRequest } from "../services/pullRequest.services.js";
import { inngestClient } from "../inngest/client.js";

export const githubWebhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

githubWebhooks.on("installation.created", async ({ payload }) => {
  console.log("Installation Created");
  console.log(payload.installation.id);
});

githubWebhooks.on("pull_request.opened", async ({ payload }) => {
  console.log("Pr opened");

  console.log({
    insId: payload?.installation?.id,
    ownerlogin: payload?.repository?.owner?.login,
    repoFullName: payload.repository.full_name,
    prnum: payload?.pull_request?.number,
  });

  const pullRequest = await createPullRequest({
    installationId: payload?.installation!.id,
    repoFullName: payload?.repository.full_name,
    prNumber: payload.pull_request.number,
    authorLogin: payload.pull_request.user.login,
    title: payload.pull_request.title,
    headSha: payload.pull_request.head.sha,
    baseBranch: payload.pull_request.base.ref,
  });

  await inngestClient.send({
    name: "pr/review.requested",
    data: {
      reviewId: pullRequest?.id,
      installationId: Number(payload.installation!.id),
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      repoFullName: payload.repository.full_name,
      prNumber: payload.pull_request.number,
      headSha: payload.pull_request.head.sha,
    },
  });
});
