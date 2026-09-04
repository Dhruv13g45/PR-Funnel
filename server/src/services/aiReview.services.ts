import { GoogleGenAI } from "@google/genai";
import { prisma } from "../db/db.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_PR_FUNNEL_API_KEY!,
});

const reviewModels = [
  process.env.GOOGLE_PR_FUNNEL_MODEL ?? "gemini-3.5-flash",
  ...(process.env.GOOGLE_PR_FUNNEL_MODEL_FALLBACKS?.split(",") ?? [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-2.5-pro",
  ]),
]
  .map((model) => model.trim())
  .filter(
    (model, index, models) =>
      model.length > 0 && models.indexOf(model) === index,
  );

function isQuotaOrRateLimitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { status?: unknown; message?: unknown };
  const status = candidate.status;
  const message =
    typeof candidate.message === "string" ? candidate.message : "";

  return (
    status === 429 ||
    status === 503 ||
    /resource[_ ]exhausted|quota|rate.?limit|too many requests/i.test(message)
  );
}

export async function generateCodeReview(
  changedCode: string,
  repositoryContext: string,
  formattedPreviousPRContext: string,
) {
  const prompt = `
You are an expert software engineer performing a code review.

Your task is to review the CURRENT pull request using:
1. The current PR code
2. Relevant repository context
3. Related code from previous pull requests

## CURRENT PR CODE

${changedCode}

## RELEVANT REPOSITORY CONTEXT

${repositoryContext}

## PREVIOUS RELATED PR CONTEXT

${formattedPreviousPRContext}

---

## A. CURRENT PR CODE REVIEW

Analyze the current PR for:

- Bugs
- Logical errors
- Security vulnerabilities
- Performance problems
- Incorrect error handling
- Edge cases
- Maintainability problems
- Incorrect behavior
- Data integrity problems

Only report issues that are actually relevant and supported by the provided code.

---

## B. HISTORICAL COMPARISON

Use previous related pull requests as historical context.

For each relevant previous PR:

1. Identify the specific behavior or logic present in the previous PR.
2. Identify the corresponding behavior or logic in the current PR.
3. Explain what changed.
4. Determine whether the current implementation removes, weakens, bypasses, or contradicts important previous behavior.
5. Determine the concrete consequence of that change.
6. Determine whether that consequence represents a bug, security issue, performance problem, correctness problem, or regression.
7. Consider whether the current PR intentionally replaced the previous behavior.
8. Only report a historical issue when there is reasonable evidence that the current implementation introduces a real problem.

A difference from a previous PR is NOT automatically an issue.

Do NOT report historical differences involving:

- Debug logging
- Formatting
- Variable naming
- Refactoring
- Code organization
- Comments
- Removal of temporary debugging code
- Internal implementation details that do not affect observable behavior

unless there is clear evidence that the change causes a real problem.

When uncertain whether a historical difference represents a regression, do not report it.

---

## ISSUE LOCATION

For every reported issue:

- Return the exact file path from the CURRENT PR.
- Return the exact line number where the issue occurs in the CURRENT PR.
- The file path must match a file provided in the CURRENT PR CODE.
- Do not invent file paths.
- Do not use a file from a previous PR as the issue location.
- Historical PRs may explain why something is problematic, but the reported location must always point to the CURRENT PR.

Only report an issue when you can identify a reliable location in the current PR.

---

## RESPONSE FORMAT

Return ONLY valid JSON.

Always use exactly this structure:

{
  "issues": [
    {
      "severity": "critical | high | medium | low",
      "title": "Short title",
      "file": "Exact current PR file path",
      "line": 123,
      "source": "current_pr | previous_pr_comparison",
      "description": "Explain the problem",
      "suggestion": "Explain how to fix it"
    }
  ],
  "suggestions": [
    {
      "whatToImprove": "Short title on what to improve",
      "description": "Explain the improvement",
      "suggestion": "Explain how to improve it"
    }
  ]
}

If there are no issues, return:

{
  "issues": [],
  "suggestions": []
}

Do not include markdown.
Do not include code fences.
Do not include any text outside the JSON.
`;

  let lastError: unknown;

  for (const [index, model] of reviewModels.entries()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return response.text ?? "";
    } catch (error) {
      lastError = error;

      if (
        !isQuotaOrRateLimitError(error) ||
        index === reviewModels.length - 1
      ) {
        throw error;
      }

      console.warn(
        `Gemini model ${model} hit a quota/rate limit; trying fallback ${reviewModels[index + 1]}.`,
      );
    }
  }

  throw lastError;
}

export async function savePullRequestReview(
  reviewId: string,
  aiReview: string,
) {
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
}
