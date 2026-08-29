import { prisma } from "../db/db.js";

interface RepositoryInfo {
  totalRepoCount: number;
  syncedRepoCount: number;
  syncingRepoCount: number;
  failedSyncRepoCount: number;
  repositories?: {};
}

interface PullRequestInfo {
  totalPRCount: number;
  reviewdPrCount: number;
  pendingReviewPrCount: number;
}

interface ReviewInfo {
  totalReviewCount: number;
  totalIssuesFound: number;
  criticalIssueCount: number;
  highIssueCount: number;
  mediumIssueCount: number;
  lowIssueCount: number;
}

interface ReviewIssue {
  severity?: string;
}

export async function getAllPullRequestsInfo(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const installationId = Number(installation.installationId);

  const allPR = await prisma.pullRequest.findMany({
    where: {
      installationId,
    },
  });

  const reviewedPr = allPR.filter((pr) => pr.status === "completed");
  const pendingReviewPr = allPR.filter((pr) => pr.status === "processing");

  const data: PullRequestInfo = {
    totalPRCount: allPR.length,
    reviewdPrCount: reviewedPr.length,
    pendingReviewPrCount: pendingReviewPr.length,
  };

  return data;
}

export async function getAllRepositoriesInfo(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const installationId = Number(installation.installationId);

  const allRepos = await prisma.repoSync.findMany({
    where: {
      installationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const totalRepoCount = allRepos.length;
  const syncedRepos = allRepos.filter((repo) => repo.status === "synced");
  const syncingRepos = allRepos.filter((repo) => repo.status === "syncing");
  const failedSyncRepos = allRepos.filter((repo) => repo.status === "failed");

  const data: RepositoryInfo = {
    totalRepoCount,
    syncedRepoCount: syncedRepos.length,
    syncingRepoCount: syncingRepos.length,
    failedSyncRepoCount: failedSyncRepos.length,
    repositories: allRepos,
  };

  return data;
}

export async function getAllReviewsInfo(userId: string) {
  let totalIssuesFound = 0;
  let criticalIssueCount = 0;
  let highIssueCount = 0;
  let mediumIssueCount = 0;
  let lowIssueCount = 0;

  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const installationId = Number(installation.installationId);

  const reviewedPRs = await prisma.pullRequest.findMany({
    where: {
      installationId,
      status: "completed",
    },
  });

  for (const review of reviewedPRs) {
    let issues: ReviewIssue[] = [];

    if (review.reviewComment) {
      try {
        const parsedReview = JSON.parse(review.reviewComment);
        issues = Array.isArray(parsedReview.issues) ? parsedReview.issues : [];
      } catch {
        continue;
      }
    }

    totalIssuesFound += issues.length;

    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          criticalIssueCount++;
          break;

        case "high":
          highIssueCount++;
          break;

        case "medium":
          mediumIssueCount++;
          break;

        case "low":
          lowIssueCount++;
          break;
      }
    }
  }

  const data: ReviewInfo = {
    totalReviewCount: reviewedPRs.length,
    totalIssuesFound,
    criticalIssueCount,
    highIssueCount,
    mediumIssueCount,
    lowIssueCount,
  };

  return data;
}

export async function getRecentPullRequests(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const installationId = Number(installation.installationId);

  const recentPRs = await prisma.pullRequest.findMany({
    where: {
      installationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return recentPRs.map((pr) => ({
    id: pr.id,
    prNumber: pr.prNumber,
    repoFullName: pr.repoFullName,
    title: pr.title,
    authorLogin: pr.authorLogin,
    status: pr.status,
    reviewedAt: pr.reviewedAt,
    createdAt: pr.createdAt,
  }));
}

export async function getRecentReviews(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const installationId = Number(installation.installationId);

  const recentReviews = await prisma.pullRequest.findMany({
    where: {
      installationId,
      status: "completed",
    },
    orderBy: {
      reviewedAt: "desc",
    },
    take: 5,
  });

  return recentReviews.map((pr) => {
    let issues: ReviewIssue[] = [];

    if (pr.reviewComment) {
      try {
        const parsedReview = JSON.parse(pr.reviewComment);
        issues = Array.isArray(parsedReview.issues) ? parsedReview.issues : [];
      } catch {
        issues = [];
      }
    }

    return {
      id: pr.id,
      prNumber: pr.prNumber,
      repoFullName: pr.repoFullName,
      title: pr.title,
      authorLogin: pr.authorLogin,
      reviewedAt: pr.reviewedAt,
      createdAt: pr.createdAt,
      issues,
    };
  });
}

export async function getRepositoryHealth(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  if (!installation) {
    return {
      message: "No GitHub installation found",
      success: false,
    };
  }

  const repositories = await prisma.repoSync.findMany({
    where: {
      installationId: Number(installation.installationId),
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return {
    success: true,
    repositories: repositories.map((repo) => ({
      id: repo.id,
      repoFullName: repo.repoFullName,
      branch: repo.branch,
      status: repo.status,
      chunkCount: repo.chunkCount,
      syncedAt: repo.syncedAt,
      updatedAt: repo.updatedAt,
    })),
  };
}
