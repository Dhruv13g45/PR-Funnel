import { generateEmbeddings } from "./embedding.services.js";
import { searchSimilarCode, storeCodeChunk } from "./vector.services.js";
import { chunkCode } from "../utils/chunkCode.js";
import { prisma } from "../db/db.js";
import { getInstallationOctokit } from "./githubApp.services.js";

export async function indexRespositoryCode(files: any[], repository: string) {
  const chunks = chunkCode(files);

  for (const [index, chunk] of chunks.entries()) {
    const embedding = await generateEmbeddings(chunk.content);

    const vectorId = `${repository}:${chunk.path}:${index}`;

    await storeCodeChunk(vectorId, embedding, {
      repository,
      filePath: chunk.path,
      content: chunk.content,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      sourceType: "repository",
    });
  }
  return chunks.length;
}

export async function retrieveRepositoryContext(
  chunks: {
    path: string;
    content: string;
  }[],
  repository: string,
) {
  const results = [];

  for (const chunk of chunks) {
    const matches = await searchSimilarCode(chunk.content, repository);

    results.push({
      queryFile: chunk.path,
      matches,
    });
  }

  return results;
}

export function buildPreviousPRContext(previousPRContext: any[]) {
  const grouped = new Map<number, any[]>();

  for (const item of previousPRContext) {
    for (const match of item.matches || []) {
      const prNumber = match.metadata?.pullRequestNumber;

      if (!prNumber) continue;

      if (!grouped.has(prNumber)) {
        grouped.set(prNumber, []);
      }

      grouped.get(prNumber)!.push(match);
    }
  }

  return Array.from(grouped.entries()).map(([prNumber, matches]) => ({
    pullRequestNumber: prNumber,
    matches: matches
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((match) => ({
        score: match.score,
        filePath: match.metadata?.filePath,
        content: match.metadata?.content,
      })),
  }));
}

export function formatPreviousPRContext(previousPRs: any[]) {
  if (!previousPRs.length) {
    return "No previous PRs with semantically similar code were found.";
  }

  return previousPRs
    .map((pr) => {
      const code = pr.matches
        .map(
          (match: any) =>
            `File: ${match.filePath} Similarity Score: ${match.score}${match.content}`,
        )
        .join("\n\n");

      return `Previous Pull Request #${pr.pullRequestNumber} ${code}`;
    })
    .join("\n\n-----------------------------\n\n");
}

/////////////////////////////////  DRY PRINCIPLE VIOLATION CHECK LATER  ////////////////////////

export function isRelevantRepositoryFile(path: string) {
  const ignoredDirectories = [
    "node_modules/",
    ".git/",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
    "out/",
    "vendor/",
  ];

  const ignoredFiles = [".env", ".env.local", ".env.production"];

  if (ignoredDirectories.some((directory) => path.includes(directory))) {
    return false;
  }

  if (ignoredFiles.includes(path)) {
    return false;
  }

  const allowedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".cpp",
    ".c",
    ".h",
    ".cs",
    ".php",
    ".rb",
    ".swift",
    ".kt",
  ];

  return allowedExtensions.some((extension) => path.endsWith(extension));
}

export function filterRepositoryFiles(tree: any[]) {
  const allowedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".cpp",
    ".c",
    ".cs",
  ];

  const ignoredDirectories = [
    "node_modules/",
    "dist/",
    "build/",
    ".git/",
    ".next/",
    "coverage/",
  ];

  return tree.filter((item) => {
    if (item.type !== "blob") {
      return false;
    }

    if (
      ignoredDirectories.some((directory) => item.path.startsWith(directory))
    ) {
      return false;
    }

    return allowedExtensions.some((extension) => item.path.endsWith(extension));
  });
}

/////////////////////////////////  DRY PRINCIPLE VIOLATION CHECK LATER  ////////////////////////

export async function markRepoSync(
  installationId: number,
  repoFullName: string,
  branch: string,
) {
  return prisma.repoSync.upsert({
    where: {
      repoFullName,
    },
    update: {
      status: "syncing",
      installationId,
      branch,
    },
    create: {
      installationId,
      repoFullName,
      branch,
      status: "syncing",
    },
  });
}

export async function markRepoSynced(repoFullName: string, chunkCount: number) {
  return prisma.repoSync.update({
    where: {
      repoFullName,
    },
    data: {
      status: "synced",
      chunkCount,
      syncedAt: new Date(),
    },
  });
}

export async function markRepoSyncFailed(repoFullName: string) {
  return prisma.repoSync.update({
    where: {
      repoFullName,
    },
    data: {
      status: "failed",
    },
  });
}


export async function getAllInstallationRepositories(
  installationId: number,
) {
  const octokit = await getInstallationOctokit(installationId);

  const repositories = [];

  let page = 1;

  while (true) {
    const response = await octokit.request(
      "GET /installation/repositories",
      {
        page,
        per_page: 100,
      },
    );

    repositories.push(
      ...response.data.repositories,
    );

    if (response.data.repositories.length < 100) {
      break;
    }

    page++;
  }

  return repositories;
}