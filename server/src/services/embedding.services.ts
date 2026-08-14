import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_PR_FUNNEL_API_KEY!,
});

export async function generateEmbeddings(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-eembedding-001",
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    },
  });
  return response.embeddings?.[0]?.values ?? [];
}
