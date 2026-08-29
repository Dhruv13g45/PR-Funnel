export function formatReviewForGithub(review: any) {
  let markdown = `## 🤖 PR-Funnel AI Code Review\n\n`;

  if (review.issues?.length) {
    markdown += `### Issues Found\n\n`;

    for (const issue of review.issues) {

      markdown += `### ${issue.severity.toUpperCase()} — ${issue.title}\n\n`;
      // markdown += `**Source:** ${source}\n\n`;
      markdown += `### File: ${issue.file} - Line no: ${issue.line}`

      markdown += `**Problem**\n\n`;
      markdown += `${issue.description}\n\n`;

      markdown += `**Suggestion**\n\n`;
      markdown += `${issue.suggestion}\n\n`;

      markdown += `---\n\n`;
    }
  } else {
    markdown += `### ✅ No significant issues found\n\n`;

    markdown += `No significant problems found in the changed code.\n`;
  }

  return markdown;
}
