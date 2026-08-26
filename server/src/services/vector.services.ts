import { pineconeIndex } from "../lib/pinecone.js";
import { generateEmbeddings } from "./embedding.services.js";

export async function storeCodeChunk(
  id: string,
  embedding: number[],
  metadata: {
    repository: string;
    pullRequestNumber?: number;
    filePath: string;
    content: string;
    startLine: number;
    endLine: number;
    sourceType: "pr" | "repository"
  },
) {
  await pineconeIndex.upsert({
    records: [
      {
        id,
        values: embedding,
        metadata,
      },
    ],
  });
}

export async function querySimilarCode(
  embedding: number[],
  repository: string,
  topK: number = 5,
) {
  const result = await pineconeIndex.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: {
      repository: {
        $eq: repository,
      },
    },
  });

  return result.matches;
}

export async function deleteRepositoryVectors(repository: string) {
  await pineconeIndex.deleteMany({
    filter: {
      repository: {
        $eq: repository,
      },
    },
  });
}

export async function searchSimilarCode(query: string, repository: string) {
  const embedding = await generateEmbeddings(query);

  return await querySimilarCode(embedding, repository, 5);
}

export async function retrieveRelevantCode(
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

export async function searchPreviousPRContext(
  embedding: number[],
  repository: string,
  currentPrNumber: number,
  topK: number = 10,
  similarityThreshold: number = 0.8,
) {
  try {
    const result = await pineconeIndex.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: {
        $and: [
          {
            repository: {
              $eq: repository,
            },
          },
          {
            pullRequestNumber: {
              $ne: currentPrNumber,
            },
          },
        ],
      },
    });

    return result.matches.filter(
      (match) => (match.score ?? 0) >= similarityThreshold,
    );
  } catch (error) {
    console.log(error);
    console.log("Error in searching previous pr context");
    return [];
  }
}

export async function searchPreviousPRCode(
  query: string,
  repository: string,
  currentPrNumber: number,
) {
  const embedding = await generateEmbeddings(query);

  try {
    return searchPreviousPRContext(embedding, repository, currentPrNumber, 10);
  } catch (error) {
    console.log(error);
    console.log(
      "Error in searching the previous code from pinecone helper function",
    );
  }
}
