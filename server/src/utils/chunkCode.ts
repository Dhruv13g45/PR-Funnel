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
}

export function chunkCode(files: CodeFile[], chunkSize = 100): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);

      chunks.push({
        path: file.path,
        sha: file.sha,
        content: chunkLines.join("\n"),
        chunkIndex: Math.floor(i / chunkSize),
      });
    }
  }

  return chunks;
}
