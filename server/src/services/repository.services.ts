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
    const matches = await searchSimilarCode(
      chunk.content,
      repository,
    );

    results.push({
      queryFile: chunk.path,
      matches,
    });
  }

  return results;
}