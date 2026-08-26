import { prisma } from "../db/db.js";
import { githubApp } from "../github/githubApp.js";

export async function githubWebhookService(event: string, payload: any) {
  switch (event) {
    case "installation":
      console.log("Installation Event");
      break;

    case "installation_repositories":
      console.log("Installation Repositories Event");
      break;

    case "pull_request":
      console.log("Pull Request Event");
      break;

    case "ping":
      console.log("Ping Event");
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }
}

export function githubInstallationService(state: string): string {
  return `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new?state=${encodeURIComponent(state)}`;
}

export async function getAllReviewsService(installationId: number) {
  return await prisma.pullRequest.findMany({
    where: {
      installationId: Number(installationId),
      reviewComment: { not: null },
    },
    select: {
      id: true,
      repoFullName: true,
      baseBranch: true,
      prNumber: true,
      title: true,
      status: true,
      reviewComment: true,
      reviewedAt: true,
    },
    orderBy: { reviewedAt: "desc" },
  });
}

export async function getAllPullRequestsService(installationId: number) {
  return await prisma.pullRequest.findMany({
    where: {
      installationId: Number(installationId),
    },
    select: {
      id: true,
      repoFullName: true,
      prNumber: true,
      title: true,
      authorLogin: true,
      baseBranch: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPullRequestDetailsService(
  installationId: number,
  repoFullName: string,
  pullNumber: number,
) {
  const [owner, repo] = repoFullName.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid repository name");
  }

  const octokit = await githubApp.getInstallationOctokit(installationId);
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
    },
  );

  return {
    title: data.title,
    body: data.body,
    htmlUrl: data.html_url,
    state: data.state,
    userLogin: data.user?.login,
    additions: data.additions,
    deletions: data.deletions,
    changedFiles: data.changed_files,
  };
}
