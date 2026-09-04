import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import QuietInteractiveBackdrop from "@/components/common/QuietInteractiveBackdrop";

interface ReviewIssue {
  severity: string;
  title: string;
  file?: string;
  line?: number;
  description: string;
  suggestion: string;
}

interface ReviewResult {
  issues?: ReviewIssue[];
  suggestions?: {
    whatToImprove: string;
    description: string;
    suggestion: string;
  }[];
}

interface ReviewRecord {
  id: string;
  repoFullName: string;
  baseBranch: string;
  prNumber: number;
  title: string;
  status: string;
  reviewComment: string;
  reviewedAt: string | null;
}

interface ReviewsResponse {
  reviews: ReviewRecord[];
}

function parseReview(reviewComment: string): ReviewResult {
  try {
    return JSON.parse(reviewComment) as ReviewResult;
  } catch {
    return {
      suggestions: [
        {
          whatToImprove: "Review",
          description: reviewComment,
          suggestion: "",
        },
      ],
    };
  }
}

const Review = () => {
  const [search, setSearch] = useState("");
  const reviewsQuery = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await api.get<ReviewsResponse>("/github/reviews");
      return data.reviews;
    },
  });

  const reviews = reviewsQuery.data ?? [];
  const filteredReviews = reviews.filter((review) =>
    review.repoFullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-full flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100">
      <QuietInteractiveBackdrop>
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-800/80 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                <Sparkles className="size-4" /> AI analysis
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Review Record
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Open a review to inspect the findings from a specific repository
                and branch.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              <strong className="text-slate-200">{reviews.length}</strong>{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </header>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories"
                aria-label="Search reviews by repository"
                className="border-slate-800 bg-slate-900/60 pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
              />
            </div>
          </div>

          {reviewsQuery.isPending && (
            <div className="grid gap-3" aria-label="Loading reviews">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl border border-slate-800/70 bg-slate-900/50"
                />
              ))}
            </div>
          )}

          {reviewsQuery.isError && (
            <Card className="border-rose-500/30 bg-rose-950/20 text-slate-200">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="size-5 text-rose-400" />
                <div>
                  <p className="font-medium">Could not load reviews</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Check your GitHub App connection and try again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => reviewsQuery.refetch()}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-sky-500/60 hover:text-sky-300 sm:ml-auto"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              </CardContent>
            </Card>
          )}

          {!reviewsQuery.isPending &&
            !reviewsQuery.isError &&
            filteredReviews.length === 0 && (
              <Card className="border-slate-800/80 bg-slate-900/35">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="mb-4 size-8 text-slate-500" />
                  <h2 className="font-medium text-slate-200">
                    {search ? "No matching repositories" : "No AI reviews yet"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {search
                      ? "Try a different repository name."
                      : "Completed pull request reviews will appear here."}
                  </p>
                </CardContent>
              </Card>
            )}

          <div className="grid gap-3">
            {!reviewsQuery.isPending &&
              filteredReviews.map((review) => {
                const result = parseReview(review.reviewComment);
                const issues = result.issues ?? [];
                const suggestions = result.suggestions ?? [];

                return (
                  <details
                    key={review.id}
                    className="group w-full max-w-full overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/45 open:border-sky-500/30 open:bg-slate-900/70"
                  >
                    <summary className="relative flex min-w-0 cursor-pointer list-none items-start gap-3 px-4 py-4 pr-12 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-sky-500/60 md:items-center md:gap-4 md:px-5 md:py-5 md:pr-12 [&::-webkit-details-marker]:hidden">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-sky-400">
                        <GitBranch className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="truncate font-semibold text-slate-100">
                            {review.repoFullName}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-slate-700 text-slate-300"
                          >
                            PR #{review.prNumber}
                          </Badge>
                        </span>
                        <span className="mt-1 flex min-w-0 flex-col items-start gap-1 text-xs text-slate-500 md:flex-row md:flex-wrap md:items-center md:gap-x-3">
                          <span>
                            branch:{" "}
                            <strong className="font-medium text-slate-300">
                              {review.baseBranch}
                            </strong>
                          </span>
                          <span className="w-full truncate md:w-auto">
                            {review.title}
                          </span>
                        </span>
                      </span>
                      <ChevronDown className="absolute right-4 top-5 size-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180 md:top-1/2 md:-translate-y-1/2" />
                    </summary>
                    <div className="border-t border-slate-800/80 px-4 py-5 sm:px-5 sm:py-6">
                      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-emerald-400" />{" "}
                          {issues.length}{" "}
                          {issues.length === 1 ? "issue" : "issues"}
                        </span>
                        {review.reviewedAt && (
                          <span>
                            Reviewed{" "}
                            {new Date(review.reviewedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {issues.length > 0 && (
                        <div className="grid gap-3">
                          {issues.map((issue, index) => (
                            <article
                              key={`${issue.title}-${index}`}
                              className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-rose-500/15 text-rose-300">
                                  {issue.severity}
                                </Badge>
                                <h2 className="min-w-0 break-words font-medium text-slate-200">
                                  {issue.title}
                                </h2>
                              </div>
                              {issue.file && (
                                <p className="mt-3 break-all font-mono text-xs text-sky-400">
                                  {issue.file}
                                  {issue.line ? `:${issue.line}` : ""}
                                </p>
                              )}
                              <p className="mt-3 text-sm leading-6 text-slate-400">
                                {issue.description}
                              </p>
                              {issue.suggestion && (
                                <p className="mt-3 border-l-2 border-emerald-500/50 pl-3 text-sm leading-6 text-slate-300">
                                  {issue.suggestion}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div className="mt-5 grid gap-3">
                          {suggestions.map((suggestion, index) => (
                            <article
                              key={`${suggestion.whatToImprove}-${index}`}
                              className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
                            >
                              <h2 className="font-medium text-slate-200">
                                {suggestion.whatToImprove}
                              </h2>
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {suggestion.description}
                              </p>
                              {suggestion.suggestion && (
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {suggestion.suggestion}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                      {issues.length === 0 && suggestions.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No significant issues found in this review.
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
          </div>
        </div>
      </QuietInteractiveBackdrop>
    </main>
  );
};

export default Review;
