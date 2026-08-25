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

export function extractChangedLines(files: any[]) {
  const changedLines: {
    file: string;
    lines: number[];
  }[] = [];

  for (const file of files) {
    if (!file.patch) {
      continue;
    }

    const lines: number[] = [];

    const patchLines = file.patch.split("\n");

    let newLineNumber = 0;

    for (const line of patchLines) {
      const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

      if (match) {
        newLineNumber = Number(match[1]);
        continue;
      }

      if (line.startsWith("+") && !line.startsWith("+++")) {
        lines.push(newLineNumber);
        newLineNumber++;
        continue;
      }

      if (line.startsWith("-") && !line.startsWith("---")) {
        continue;
      }

      newLineNumber++;
    }

    changedLines.push({
      file: file.filename,
      lines,
    });
  }

  return changedLines;
}

export async function validateReviewLocations(
  review: any,
  changedLines: {
    file: string;
    lines: number[];
  }[],
) {
  if (!review?.issues?.length) {
    return {
      issues: [],
    };
  }

  const validIssues = review.issues.filter((issue: any) => {
    if (!issue.file || !issue.line) {
      return false;
    }

    const changedFile = changedLines.find((file) => file.file === issue.file);

    if (!changedFile) {
      return false;
    }

    return changedFile.lines.includes(Number(issue.line));
  });

  return {
    issues: validIssues,
  };
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

  console.log("File data", data);

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
    console.log("Filtering file:", file);
    if (!file.path) {
      return false;
    }

    const filename = file.path.toLowerCase();

    const hasIgnoredExtension = ignoredExtensions.some((extension) =>
      filename.endsWith(extension),
    );

    const hasIgnoredPath = ignoredPaths.some((path) => filename.includes(path));

    console.log(
      filename,
      "hasIgnoredExtension:",
      hasIgnoredExtension,
      "hasIgnoredPath:",
      hasIgnoredPath,
    );

    return !hasIgnoredExtension && !hasIgnoredPath;
  });
}

export async function createPullRequestReview(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
  commitId: string,
  comments: {
    path: string;
    line: number;
    body: string;
  }[],
) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  return await octokit.request(
    "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
    {
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body: "## 🤖 PR-Funnel AI Code Review",
      event: "COMMENT",
      comments,
    },
  );
}

export async function postPullRequestReview(
  installationId: number,
  owner: string,
  repo: string,
  body: string,
  prNumber: string,
) {
  try {
    const octokit = await getInstallationOctokit(installationId);

    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      {
        owner,
        repo,
        pull_number: Number(prNumber),
        body,
        event: "COMMENT",
      },
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error("Error in the post pull request review service");
  }
}

export function formatGithubIssues(issues: []) {
  return issues.map((issue: any) => ({
    path: issue.file,
    line: Number(issue.line),
    body: `### ${issue.severity.toUpperCase()} — ${issue.title}
    \n

**Problem**

${issue.description}

**Suggestion**

${issue.suggestion}

_Source: ${issue.source}_`,
  }));
}
