import {
  generateEmbeddings,
  generateEmbeddingsBatch,
} from "../../services/embedding.services.js";
import {
  getPullRequestFiles,
  getRepositoryFile,
  filterRelevantFiles,
  postPullRequestReview,
  extractChangedLines,
  validateReviewLocations,
  formatGithubIssues,
  createPullRequestReview,
} from "../../services/githubApp.services.js";
import { markPullRequestProcessing } from "../../services/pullRequest.services.js";
import {
  buildPreviousPRContext,
  formatPreviousPRContext,
  retrieveRepositoryContext,
} from "../../services/repository.services.js";
import {
  querySimilarCode,
  searchPreviousPRCode,
  searchSimilarCode,
  storeCodeChunk,
} from "../../services/vector.services.js";
import { chunkCode } from "../../utils/chunkCode.js";
import { inngestClient } from "../client.js";
import {
  generateCodeReview,
  savePullRequestReview,
} from "../../services/aiReview.services.js";
import { formatReviewForGithub } from "../../utils/formatReviewForGithub.js";

export const prReviewPipeline = inngestClient.createFunction(
  {
    id: "pr-review-pipeline",

    triggers: [
      {
        event: "pr/review.requested",
      },
    ],
  },

  async ({ event, step }) => {
    const { reviewId } = event?.data;

    await step.run("Mark as Processing", async () => {
      await markPullRequestProcessing(reviewId);
    });

    const files = await step.run("Fetch PR Files", async () => {
      const { installationId, owner, repo, prNumber } = event?.data;
      return await getPullRequestFiles(installationId, owner, repo, prNumber);
    });

    const changedLines = await step.run("Extract Changed Lines", async () => {
      return extractChangedLines(files);
    });

    const fileContents = await step.run("Fetch PR File Contents", async () => {
      console.log("Fetching file contents for fetch PR files:", files);
      const results = [];
      const { installationId, owner, repo, headSha } = event?.data;

      for (const file of files) {
        if (file.status === "removed") {
          console.log(`Skipping deleted file: ${file.filename}`);
          continue;
        }

        const content = await getRepositoryFile(
          installationId,
          owner,
          repo,
          file.filename,
          headSha,
        );

        results.push(content);
      }

      return results;
    });

    const relevantFiles = await step.run("Filter relevant files", async () => {
      console.log("Filtering relevant files from file contents:", fileContents);
      return filterRelevantFiles(fileContents);
    });

    const chunks = await step.run("Chunk Code", async () => {
      const result = chunkCode(relevantFiles);

      if (!result.length) {
        throw new Error("No code chunks were generated");
      }

      return result;
    });

    // await step.run("Generate and store embeddings", async () => {
    //   for (const [index, chunk] of chunks.entries()) {
    //     const embedding = await generateEmbeddings(chunk.content);

    //     const vectorId = `${event.data.owner}/${event.data.repo}:${event.data.prNumber}:${chunk.path}:${index}`;

    //     await storeCodeChunk(vectorId, embedding, {
    //       repository: `${event?.data.owner}/${event?.data.repo}`,
    //       pullRequestNumber: event?.data.prNumber,
    //       filePath: chunk.path,
    //       content: chunk.content,
    //       startLine: chunk.startLine,
    //       endLine: chunk.endLine,
    //       sourceType: "pr",
    //     });
    //   }
    // });

    await step.run("Generate and store embeddings", async () => {
      const texts = chunks.map((chunk) => chunk.content);

      const embeddings = (await generateEmbeddingsBatch(texts)) ?? [];

      if (embeddings.length !== chunks.length) {
        throw new Error(
          `Embedding count mismatch. Chunks: ${chunks.length}, Embeddings: ${embeddings.length}`,
        );
      }

      for (const [index, chunk] of chunks.entries()) {
        const embedding = embeddings[index];

        if (!embedding) {
          throw new Error(
            `Missing embedding for chunk ${index}: ${chunk.path}`,
          );
        }

        const vectorId =
          `${event.data.owner}/${event.data.repo}:` +
          `${event.data.prNumber}:${chunk.path}:${index}`;

        await storeCodeChunk(vectorId, embedding, {
          repository: `${event.data.owner}/${event.data.repo}`,

          pullRequestNumber: event.data.prNumber,

          filePath: chunk.path,

          content: chunk.content,

          startLine: chunk.startLine,

          endLine: chunk.endLine,

          sourceType: "pr",
        });
      }
    });

    const previousPRContext = await step.run(
      "Retrieve Previous PR Context",
      async () => {
        const repository = `${event.data.owner}/${event.data.repo}`;
        const currentPrNumber = event.data.prNumber;

        const results = [];

        for (const chunk of chunks) {
          const matches = await searchPreviousPRCode(
            chunk.content,
            repository,
            currentPrNumber,
          );

          results.push({
            currentChunk: chunk,
            matches,
          });
        }

        return results;
      },
    );

    const previousPRs = await step.run(
      "Build Previous PR Context",
      async () => {
        return buildPreviousPRContext(previousPRContext);
      },
    );

    const formattedPreviousPRContext = await step.run(
      "Format the previous pr context",
      async () => {
        return formatPreviousPRContext(previousPRs);
      },
    );

    await step.run("Debug previous pr formatting", async () => {
      console.log(formattedPreviousPRContext);
    });

    const relevantCode = await step.run(
      "Retrieve Repository Context",
      async () => {
        const repository = `${event.data.owner}/${event.data.repo}`;

        return retrieveRepositoryContext(chunks, repository);
      },
    );

    const aiReview = await step.run("Generate AI Code Review", async () => {
      const changedCode = chunks
        .map((chunk) => {
          const numberedCode = chunk.content
            .split("\n")
            .map((line, index) => {
              const lineNumber = chunk.startLine + index;

              return `${lineNumber}: ${line}`;
            })
            .join("\n");

          return `File: ${chunk.path} Lines ${chunk.startLine}-${chunk.endLine} ${numberedCode}`;
        })
        .join("\n\n---\n\n");

      const repositoryContext = relevantCode
        .flatMap((item) => item.matches || [])
        .map((match) => match.metadata?.content)
        .filter((content): content is string => Boolean(content))
        .join("\n\n");

      const response = await generateCodeReview(
        changedCode,
        repositoryContext,
        formattedPreviousPRContext,
      );

      const responseText = response?.trim();

      if (!responseText) {
        throw new Error("Gemini returned an empty response");
      }

      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error("Gemini returned invalid JSON:");
        console.error(responseText);

        throw new Error("Gemini returned invalid JSON");
      }
    });

    await step.run("Log ai review", async () => {
      console.log(aiReview);
    });

    const validatedReview = await step.run(
      "Validate the ai review locations",
      async () => {
        return validateReviewLocations(aiReview, changedLines);
      },
    );

    const githubLineReviews = await step.run(
      "Format the line review issues for github",
      async () => {
        return formatGithubIssues(validatedReview?.issues || []);
      },
    );

    await step.run("Post the line review issues on github", async () => {
      if (!githubLineReviews.length) {
        console.log("No inline review issues to post");
        return;
      }

      const { installationId, owner, repo, prNumber, headSha } = event?.data;

      return createPullRequestReview(
        installationId,
        owner,
        repo,
        prNumber,
        headSha,
        githubLineReviews,
      );
    });

    await step.run("Save AI code review", async () => {
      const { reviewId } = event?.data;
      if (!aiReview) {
        throw new Error(
          "AI review error: Could not generate AI review for the pull request",
        );
      }
      return savePullRequestReview(reviewId, JSON.stringify(aiReview));
    });

    await step.run("Post the ai review to github", async () => {
      const { installationId, owner, repo, prNumber } = event?.data;

      const formattedAiReview = formatReviewForGithub(aiReview ?? "");

      return postPullRequestReview(
        installationId,
        owner,
        repo,
        formattedAiReview,
        prNumber,
      );
    });
  },

  // test pipeline
  // async ({ event, step }) => {
  //   await step.run("Testing the single line embedding", async () => {
  //     const embedding = await generateEmbeddings(
  //       "This is a test embedding for PR Funnel",
  //     );

  //     console.log("Embedding length:", embedding.length);
  //     console.log("First 5 values:", embedding.slice(0, 5));
  //   });

  //   await step.run("Testing the batch embedding", async () => {
  //     const embeddings = await generateEmbeddingsBatch([
  //       "function login() {}",
  //       "function logout() {}",
  //       "function authenticateUser() {}",
  //     ]);

  //     if (!embeddings?.length) {
  //       throw new Error("No embeddings were generated for the batch test");
  //     }

  //     console.log("Number of embeddings:", embeddings.length);
  //     console.log("Embedding dimension:", embeddings[0]?.length ?? 0);
  //   });
  // },
);
