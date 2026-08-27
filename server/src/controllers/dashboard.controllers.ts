import {
  getAllPullRequestsInfo,
  getAllRepositoriesInfo,
  getAllReviewsInfo,
  getRecentPullRequests,
  getRecentReviews,
  getRepositoryHealth,
} from "../services/dashboard.services.js";
import type { Request, Response } from "express";
import { getUserSession } from "../utils/getUserSession.js";

export async function getDashboardInfoController(req: Request, res: Response) {
  try {
    const userId = await getUserSession(req as any);

    const repoInfo = await getAllRepositoriesInfo(userId);

    const pullRequestInfo = await getAllPullRequestsInfo(userId);

    const reviewsInfo = await getAllReviewsInfo(userId);

    const recentPullRequests = await getRecentPullRequests(userId);

    const recentReviews = await getRecentReviews(userId);

    const repositoryHealth = await getRepositoryHealth(userId);

    return res.status(200).json({
      repositories: repoInfo,
      pullRequests: pullRequestInfo,
      reviews: reviewsInfo,
      recentPullRequests,
      recentReviews,
      repositoryHealth,
    });
  } catch (error) {
    console.error("Error fetching dashboard information:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard information",
      success: false,
    });
  }
}
