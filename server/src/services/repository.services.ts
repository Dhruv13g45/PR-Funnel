import { generateEmbeddings } from "./embedding.services.js";
import { searchSimilarCode, storeCodeChunk } from "./vector.services.js";
import { chunkCode } from "../utils/chunkCode.js";

export async function indexRespositoryCode(files: any[], repository: string) {
  const chunks = chunkCode(files);

  for (const [index, chunk] of chunks.entries()) {
    const embedding = await generateEmbeddings(chunk.content);

    const vectorId = `${repository}:${chunk.path}:${index}`;

    await storeCodeChunk(vectorId, embedding, {
      repository,
      pullRequestNumber: 0,
      filePath: chunk.path,
      content: chunk.content,
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
