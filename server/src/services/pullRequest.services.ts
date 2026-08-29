import { prisma } from "../db/db.js";

export async function markPullRequestProcessing(reviewId: string) {
  return await prisma.pullRequest.update({
    where: {
      id: reviewId,
    },
    data: {
      status: "processing",
    },
  });
}

type PullRequest = {
  installationId: number;
  repoFullName: string;
  prNumber: number;
  authorLogin: string;
  title: string;
  headSha: string;
  baseBranch: string;
};

export async function createPullRequest({
  installationId,
  repoFullName,
  prNumber,
  authorLogin,
  title,
  headSha,
  baseBranch,
}: PullRequest) {
  try {
    return await prisma.pullRequest.upsert({
      where: {
        repoFullName_prNumber: {
          repoFullName,
          prNumber,
        },
      },
      create: {
        installationId,
        repoFullName,
        prNumber,
        authorLogin,
        title,
        headSha,
        baseBranch,
      },
      update: {
        installationId,
        authorLogin,
        title,
        headSha,
        baseBranch,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Internal error occured");
  }
}

export async function savePullRequestReview(
  reviewId: string,
  aiReview: string,
) {
  return prisma.pullRequest.update({
    where: {
      id: reviewId,
    },
    data: {
      reviewComment: aiReview,
      status: "completed",
      reviewedAt: new Date(),
    },
  });
}
