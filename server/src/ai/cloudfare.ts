const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID is not defined");
}

if (!CLOUDFLARE_API_TOKEN) {
  throw new Error("CLOUDFLARE_API_TOKEN is not defined");
}

const CLOUDFLARE_AI_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

export async function generateCloudflareEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await fetch(`${CLOUDFLARE_AI_URL}/${EMBEDDING_MODEL}`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      text: texts,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Cloudflare embedding request failed: ${response.status} ${errorBody}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare embedding failed: ${JSON.stringify(data.errors)}`,
    );
  }

  return data.result.data;
}
