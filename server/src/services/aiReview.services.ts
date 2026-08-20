import { GoogleGenAI } from "@google/genai";
import { prisma } from "../db/db.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_PR_FUNNEL_API_KEY!,
});

export async function generateCodeReview(
  changedCode: string,
  repositoryContext: string,
  formattedPreviousPRContext: string,
) {
  const prompt = `
You are an expert software engineer performing a code review.

Review the following changed code from a pull request.

## Changed Code of current pr for current pr context

${changedCode}

## Relevant Repository Context

${repositoryContext}

## Changed Code of previous pr for pervious pr context

${formattedPreviousPRContext}

Use the previous related pull requests as historical context.

When reviewing the current pull request:

1. Identify what the current PR changes.
2. Identify relevant behavior or code that existed in previous PRs.
3. Determine whether the current PR conflicts with or bypasses behavior introduced previously.
4. Determine whether the current PR could introduce a regression.
5. Consider whether a previous implementation appears to have been intentionally changed or replaced.
6. Continue to identify normal bugs, security issues, performance problems, and correctness issues in the current PR.

Do not assume that a difference from a previous PR is automatically a bug.
Only report an issue when there is reasonable evidence that the current implementation causes a problem.

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
