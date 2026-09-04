const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const EMBEDDING_MODELS = [
  process.env.CLOUDFLARE_EMBEDDING_MODEL ?? "@cf/baai/bge-base-en-v1.5",
  ...(process.env.CLOUDFLARE_EMBEDDING_MODEL_FALLBACKS?.split(",") ?? []),
]
  .map((model) => model.trim())
  .filter(
    (model, index, models) =>
      model.length > 0 && models.indexOf(model) === index,
  );

const EMBEDDING_DIMENSION = 768;

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID is not defined");
}

if (!CLOUDFLARE_API_TOKEN) {
  throw new Error("CLOUDFLARE_API_TOKEN is not defined");
}

const CLOUDFLARE_AI_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

function isQuotaOrTransientError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { status?: unknown; message?: unknown };
  const message =
    typeof candidate.message === "string" ? candidate.message : "";

  return (
    candidate.status === 429 ||
    candidate.status === 503 ||
    /quota|rate.?limit|too many requests|capacity|temporarily unavailable/i.test(
      message,
    )
  );
}

async function requestEmbeddings(texts: string[], model: string) {
  const response = await fetch(`${CLOUDFLARE_AI_URL}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texts }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw Object.assign(
      new Error(`Cloudflare embedding request failed: ${response.status} ${error}`),
      { status: response.status },
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare embedding failed: ${JSON.stringify(data.errors)}`);
  }

  const embeddings = data.result?.data;

  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error(
      `Embedding count mismatch. Expected ${texts.length}, got ${embeddings?.length ?? 0}`,
    );
  }

  for (const embedding of embeddings) {
    if (embedding.length !== EMBEDDING_DIMENSION) {
      throw new Error(
        `Invalid embedding dimension. Expected ${EMBEDDING_DIMENSION}, got ${embedding.length}`,
      );
    }
  }

  return embeddings as number[][];
}

async function requestEmbeddingsWithFallback(texts: string[]) {
  let lastError: unknown;

  for (const [index, model] of EMBEDDING_MODELS.entries()) {
    try {
      return await requestEmbeddings(texts, model);
    } catch (error) {
      lastError = error;

      if (
        !isQuotaOrTransientError(error) ||
        index === EMBEDDING_MODELS.length - 1
      ) {
        throw error;
      }

      console.warn(
        `Cloudflare model ${model} is unavailable; trying fallback ${EMBEDDING_MODELS[index + 1]}.`,
      );
    }
  }

  throw lastError;
}

export async function generateEmbeddings(text: string) {
  const [embedding] = await requestEmbeddingsWithFallback([text]);

  if (!embedding) {
    throw new Error("Cloudflare returned no embedding");
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

    const embeddings = await requestEmbeddingsWithFallback(batch);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}
