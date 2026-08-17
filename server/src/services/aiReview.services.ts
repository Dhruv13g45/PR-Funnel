import { GoogleGenAI } from "@google/genai";
import { prisma } from "../db/db.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_PR_FUNNEL_API_KEY!,
});

export async function generateCodeReview(
  changedCode: string,
  repositoryContext: string,
) {
  const prompt = `
You are an expert software engineer performing a code review.

Review the following changed code from a pull request.

## Changed Code

${changedCode}

## Relevant Repository Context

${repositoryContext}

Analyze the changed code for:

- Bugs
- Logical errors
- Security vulnerabilities
- Performance problems
- Incorrect error handling
- Edge cases
- Maintainability problems

Only report issues that are actually relevant.

Return your response ONLY as valid JSON.

Use exactly this structure:

{
  "issues": [
    {
      "severity": "critical | high | medium | low",
      "title": "Short title",
      "description": "Explain the problem",
      "suggestion": "Explain how to fix it"
    }
  ]
}

If there are no significant issues, return:

{
  "issues": []
}

And if there are no issues or no major or significant issues then, return:
{
  "suggestions":
  [
    {
      "whatToImprove": "Short title on what to improve",
      "description": "Explain the improvement",
      "suggestion": "Explain how to improve it"
    }
  ]
}


Do not include markdown.
Do not include code fences.
Do not include any text outside the JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  return response.text;
}

export async function savePullRequestReview(
  reviewId: string,
  aiReview: string,
) {
  try {
    return prisma.pullRequest.update({
      where: {
        id: reviewId,
      },
      data: {
        reviewComment: aiReview,
        status: "completed",
        reviewedAt: new Date(),
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
}
