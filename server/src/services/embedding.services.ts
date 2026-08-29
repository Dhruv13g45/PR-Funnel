const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID is not defined");
}

if (!CLOUDFLARE_API_TOKEN) {
  throw new Error("CLOUDFLARE_API_TOKEN is not defined");
}

const CLOUDFLARE_AI_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`;

export async function generateEmbeddings(text: string) {
  const response = await fetch(CLOUDFLARE_AI_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Cloudflare embedding request failed: ${response.status} ${error}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare embedding failed: ${JSON.stringify(data.errors)}`,
    );
  }

  const embedding = data.result?.data?.[0];

  if (!embedding) {
    throw new Error("Cloudflare returned no embedding");
  }

  if (embedding.length !== 768) {
    throw new Error(
      `Invalid embedding dimension. Expected 768, got ${embedding.length}`,
    );
  }

  return embedding;
}

export async function generateEmbeddingsBatch(
  texts: string[],
): Promise<number[][]> {
  if (!texts.length) {
    return [];
  }

  const BATCH_SIZE = 50;

  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await fetch(CLOUDFLARE_AI_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        text: batch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Cloudflare batch embedding request failed: ${response.status} ${error}`,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        `Cloudflare batch embedding failed: ${JSON.stringify(data.errors)}`,
      );
    }

    const embeddings = data.result?.data;

    if (!embeddings || embeddings.length !== batch.length) {
      throw new Error(
        `Embedding count mismatch. Expected ${batch.length}, got ${
          embeddings?.length ?? 0
        }`,
      );
    }

    for (const embedding of embeddings) {
      if (embedding.length !== 768) {
        throw new Error(
          `Invalid embedding dimension. Expected 768, got ${embedding.length}`,
        );
      }
    }

    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
