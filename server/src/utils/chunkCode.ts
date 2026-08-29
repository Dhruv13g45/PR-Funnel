// export interface CodeFile {
//   path: string;
//   sha: string;
//   content: string;
// }

// export interface CodeChunk {
//   path: string;
//   sha: string;
//   content: string;
//   chunkIndex: number;
//   startLine: number;
//   endLine: number;
// }

// export function chunkCode(files: CodeFile[], chunkSize = 100): CodeChunk[] {
//   const chunks: CodeChunk[] = [];

//   for (const file of files) {
//     const lines = file.content.split("\n");

//     for (let i = 0; i < lines.length; i += chunkSize) {
//       const chunkLines = lines.slice(i, i + chunkSize);

//       chunks.push({
//         path: file.path,
//         sha: file.sha,
//         content: chunkLines.join("\n"),
//         chunkIndex: Math.floor(i / chunkSize),
//         startLine: Number(i + 1),
//         endLine: Math.min(i + chunkSize, lines.length),
//       });
//     }
//   }

//   return chunks;
// }

export interface CodeFile {
  path: string;
  sha: string;
  content: string;
}

export interface CodeChunk {
  path: string;
  sha: string;
  content: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkCode(files: CodeFile[], maxTokens = 400): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");

    let currentLines: string[] = [];
    let currentTokens = 0;
    let chunkStartLine = 0;
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";

      const lineTokens = estimateTokens(line);

      if (currentLines.length > 0 && currentTokens + lineTokens > maxTokens) {
        chunks.push({
          path: file.path,
          sha: file.sha,
          content: currentLines.join("\n"),
          chunkIndex,
          startLine: chunkStartLine + 1,
          endLine: i,
        });

        chunkIndex++;
        currentLines = [];
        currentTokens = 0;
        chunkStartLine = i;
      }

      currentLines.push(line);
      currentTokens += lineTokens;
    }

    if (currentLines.length > 0) {
      chunks.push({
        path: file.path,
        sha: file.sha,
        content: currentLines.join("\n"),
        chunkIndex,
        startLine: chunkStartLine + 1,
        endLine: lines.length,
      });
    }
  }

  return chunks;
}
