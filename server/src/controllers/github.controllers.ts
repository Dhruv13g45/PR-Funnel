import type { Request, Response } from "express";
import {
  githubInstallationService,
  githubWebhookService,
} from "../services/github.services.js";
import { githubWebhooks } from "../github/githubWebhook.js";
import {
  getInstallationDetails,
  getInstallationOctokit,
  githubDisconnectService,
  saveInstallationDetails,
} from "../services/githubApp.services.js";
import { getUserSession } from "../utils/getUserSession.js";
import { generateGithubState, verifyGithuState } from "../utils/githubState.js";
import { prisma } from "../db/db.js";
import { inngestClient } from "../inngest/client.js";
import {
  getAllInstallationRepositories,
  markRepoSync,
} from "../services/repository.services.js";

function getGithubCollectionCount(link: string | undefined, fallback: number) {
  const lastPage = link?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
  return lastPage ? Number(lastPage) : fallback;
}

async function getGithubCollectionSize(request: Promise<any>) {
  try {
    const response = await request;

    return getGithubCollectionCount(
      response.headers.link,
      response.data.length,
    );
  } catch (error: any) {
    if (error?.status === 409) {
      return 0;
    }

    throw error;
  }
}

export async function githubWebhookController(req: Request, res: Response) {
  try {
    await githubWebhooks.verifyAndReceive({
      id: req.headers["x-github-delivery"] as string,
      name: req.headers["x-github-event"] as string,
      signature: req.headers["x-hub-signature-256"] as string,
      payload: (req?.rawBody ?? "").toString(),
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }
}

export async function githubInstallationController(
  req: Request,
  res: Response,
) {
  const userId = await getUserSession(req as any);

  const state = generateGithubState(userId);

  const url: string = githubInstallationService(state);

  if (!url) {
    return res.status(500).json({
      message: "Cannot provide the github installation url",
    });
  }

  return res.status(200).json({
    message: "Got the installation url",
    data: url,
  });
}

export async function githubCallbackController(req: Request, res: Response) {
  console.log("Github callback");

  const installationId = Number(req.query.installation_id);

  const state = req.query.state as string;

  const payload = verifyGithuState(state);

  console.log(payload);

  const installFlag = await saveInstallationDetails(
    payload?.userId as string,
    installationId,
  );

  return res.redirect(
    `http://localhost:5173/github-apps?installed=${installFlag}`,
  );
}

export async function githubDisconnectController(req: Request, res: Response) {
  const userId = await getUserSession(req as any);

  if (userId) {
    const response = (await githubDisconnectService(userId)) as {
      message: string;
      success: boolean;
    } | null;

    const success = response?.success ?? undefined;

    return res.status(200).json({ message: response?.message ?? "", success });
  }

  return res.status(401).json({ message: "Unauthorized", success: false });
}

export async function getGithubInstallationStatusController(
  req: Request,
  res: Response,
) {
  try {
    const userId = await getUserSession(req as any);

    const installation = await prisma.githubInstallation.findUnique({
      where: {
        userId,
      },
    });

    return res.status(200).json({
      success: true,
      installed: !!installation,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      installed: false,
    });
  }
}

export async function getAllRepoController(req: Request, res: Response) {
  try {
    const userId = await getUserSession(req as any);

    const githubInstallation = await prisma.githubInstallation.findUnique({
      where: { userId },
    });

    if (!githubInstallation) {
      return res.status(404).json({
        message: "GitHub App is not installed",
        repositories: [],
      });
    }

    const installationId = Number(githubInstallation.installationId);

    const octokit = await getInstallationOctokit(installationId);

    const repositoriesData =
      await getAllInstallationRepositories(installationId);

    const repositories = await Promise.all(
      repositoriesData.map(async (repository) => {
        const owner = repository.owner.login;
        const repo = repository.name;

        const [branches, commits] = await Promise.all([
          getGithubCollectionSize(
            octokit.request(`GET /repos/${owner}/${repo}/branches`, {
              owner,
              repo,
              per_page: 1,
            }),
          ),
          getGithubCollectionSize(
            octokit.request(`GET /repos/${owner}/${repo}/commits`, {
              owner,
              repo,
              per_page: 1,
            }),
          ),
        ]);

        return {
          id: repository.id,
          name: repository.name,
          fullName: repository.full_name,
          owner,
          description: repository.description,
          visibility: repository.private ? "private" : "public",
          defaultBranch: repository.default_branch,

          branches,
          commits,

          updatedAt: repository.updated_at,
        };
      }),
    );

    return res.status(200).json({
      repositories,
    });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);

    return res.status(500).json({
      message: "Failed to fetch GitHub repositories",
      repositories: [],
    });
  }
}

export async function repositorySyncController(req: Request, res: Response) {
  const { owner, repo } = req.body;

  try {
    if (!owner || !repo) {
      return res.status(400).json({
        message: "owner and repo are required",
      });
    }

    const userId = await getUserSession(req as any);

    const githubInstallation = await prisma.githubInstallation.findUnique({
      where: {
        userId,
      },
    });

    if (!githubInstallation) {
      return res.status(404).json({
        message: "GitHub App is not installed",
      });
    }

    const repoFullName = `${owner}/${repo}`;

    await markRepoSync(
      Number(githubInstallation.installationId),
      repoFullName,
      "main",
    );

    await inngestClient.send({
      name: "pr/repoSync.requested",
      data: {
        installationId: Number(githubInstallation.installationId),
        owner,
        repo,
      },
    });

    return res.status(202).json({
      message: "Repository sync started",
      repository: repoFullName,
    });
  } catch (error) {
    console.error("Error starting repository sync:", error);

    return res.status(500).json({
      message: "Failed to start repository sync",
    });
  }
}

export async function getRepositorySyncStatusController(
  req: Request,
  res: Response,
) {
  const owner = String(req.query.owner ?? "");
  const repo = String(req.query.repo ?? "");

  if (!owner || !repo) {
    return res.status(400).json({
      message: "owner and repo are required",
    });
  }

  try {
    const userId = await getUserSession(req as any);
    const installation = await prisma.githubInstallation.findUnique({
      where: { userId },
    });

    if (!installation) {
      return res.status(404).json({
        message: "GitHub App is not installed",
      });
    }

    const sync = await prisma.repoSync.findUnique({
      where: { repoFullName: `${owner}/${repo}` },
    });

    if (!sync || sync.installationId !== Number(installation.installationId)) {
      return res.status(200).json({
        repository: `${owner}/${repo}`,
        status: "pending",
        chunkCount: 0,
      });
    }

    return res.status(200).json({
      repository: sync.repoFullName,
      status: sync.status,
      chunkCount: sync.chunkCount,
      syncedAt: sync.syncedAt,
    });
  } catch (error) {
    console.error("Error fetching repository sync status:", error);

    return res.status(500).json({
      message: "Failed to fetch repository sync status",
    });
  }
}
