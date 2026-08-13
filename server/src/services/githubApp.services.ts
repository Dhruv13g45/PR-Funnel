import { prisma } from "../db/db.js";
import { githubApp } from "../github/githubApp.js";

export async function getInstallationOctokit(installationId: number) {
  return await githubApp.getInstallationOctokit(installationId);
}

export async function getInstallationDetails(installationId: number) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  const { data } = await octokit.request(
    "GET /app/installations/{installation_id}",
    {
      installation_id: installationId,
    },
  );

  return data;
}

export async function saveInstallationDetails(
  userId: string,
  installationId: number,
) {
  const installationDetails = await getInstallationDetails(installationId);
  const account = installationDetails.account as
    | { login?: string; type?: string }
    | { name?: string; slug?: string }
    | null;

  const accountLogin = account && "login" in account ? account.login : null;
  const accountType = account && "type" in account ? account.type : null;

  try {
    await prisma.githubInstallation.upsert({
      where: {
        userId,
      },
      update: {
        installationId: installationDetails?.id,
        accountLogin,
        accountType,
      },
      create: {
        userId,
        installationId: installationDetails?.id,
        accountLogin,
        accountType,
      },
    });

    return {
      userPayload: {
        userId,
      },
      installed: true,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function githubDisconnectService(userId: string) {
  if (!userId) {
    return {
      message: "No user id found",
      success: false,
    };
  }

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

  try {
    const response = await githubApp.octokit.request(
      "DELETE /app/installations/{installation_id}",
      {
        installation_id: installationId,
        headers: {
          "X-GitHub-Api-Version": "2026-03-10",
          Accept: "application/vnd.github+json",
        },
      },
    );

    console.log("GitHub uninstall response:", response.status);

    await prisma.githubInstallation.delete({
      where: {
        userId,
      },
    });

    return {
      message: "GitHub App uninstalled successfully",
      success: true,
    };
  } catch (error: any) {
    console.error("GitHub disconnect error:", error);

    return {
      message: error?.message || "Failed to uninstall GitHub App",
      success: false,
    };
  }
}

export async function getPullRequestFiles(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
    },
  );

  return data;
}

export async function getRepositoryFile(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref: string,
) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
      ref,
    },
  );

  if (Array.isArray(data)) {
    throw new Error(`Expected a file but received a directory: ${path}`);
  }

  if (!("content" in data) || !data.content) {
    throw new Error(`No content found for file: ${path}`);
  }

  return {
    path,
    sha: data.sha,
    content: Buffer.from(data.content, "base64").toString("utf-8"),
  };
}

export function filterRelevantFiles(files: any[]) {
  const ignoredExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".mp4",
    ".mp3",
    ".zip",
    ".pdf",
    ".lock",
  ];

  const ignoredPaths = [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
  ];

  return files.filter((file) => {
    const filename = file.filename.toLowerCase();

    const hasIgnoredExtension = ignoredExtensions.some((extension) =>
      filename.endsWith(extension),
    );

    const hasIgnoredPath = ignoredPaths.some((path) => filename.includes(path));


    return !hasIgnoredExtension && !hasIgnoredPath;
  });
}
