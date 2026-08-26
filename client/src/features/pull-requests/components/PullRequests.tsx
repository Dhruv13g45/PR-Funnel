import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import QuietInteractiveBackdrop from "@/components/common/QuietInteractiveBackdrop";

interface Repository {
  id: number;
  fullName: string;
  branches: number;
  commits: number;
}

interface PullRequest {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  baseBranch: string;
  status: string;
  createdAt: string;
}

interface RepositoriesResponse {
  repositories: Repository[];
}

interface PullRequestsResponse {
  pullRequests: PullRequest[];
}

interface PullRequestDetails {
  title: string;
  body: string | null;
  htmlUrl: string;
  state: string;
  userLogin?: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

interface PullRequestDetailsResponse {
  pullRequest: PullRequestDetails;
}

const PullRequests = () => {
  const [search, setSearch] = useState("");
  const [openRepository, setOpenRepository] = useState<string | null>(null);
  const [selectedPullRequest, setSelectedPullRequest] =
    useState<PullRequest | null>(null);

  const repositoriesQuery = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data } = await api.get<RepositoriesResponse>(
        "/github/repositories",
      );
      return data.repositories;
    },
  });

  const pullRequestsQuery = useQuery({
    queryKey: ["pull-requests"],
    queryFn: async () => {
      const { data } = await api.get<PullRequestsResponse>(
        "/github/pull-requests",
      );
      return data.pullRequests;
    },
  });

  const pullRequestDetailsQuery = useQuery({
    queryKey: [
      "pull-request-details",
      selectedPullRequest?.repoFullName,
      selectedPullRequest?.prNumber,
    ],
    enabled: selectedPullRequest !== null,
    queryFn: async () => {
      if (!selectedPullRequest) {
        throw new Error("No pull request selected");
      }

      const { data } = await api.get<PullRequestDetailsResponse>(
        "/github/pull-requests/detail",
        {
          params: {
            repo: selectedPullRequest.repoFullName,
            number: selectedPullRequest.prNumber,
          },
        },
      );
      return data.pullRequest;
    },
  });

  const pullRequests = pullRequestsQuery.data ?? [];
  const repositories = (repositoriesQuery.data ?? [])
    .filter((repository) =>
      pullRequests.some(
        (pullRequest) => pullRequest.repoFullName === repository.fullName,
      ),
    )
    .filter((repository) =>
      repository.fullName.toLowerCase().includes(search.toLowerCase()),
    );
  const isLoading = repositoriesQuery.isPending || pullRequestsQuery.isPending;
  const isError = repositoriesQuery.isError || pullRequestsQuery.isError;

  return (
    <main className="min-h-screen w-full flex-1 overflow-y-auto bg-slate-950 text-slate-100">
      <QuietInteractiveBackdrop>
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-800/80 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                <GitPullRequest className="size-4" /> Delivery history
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Pull Requests
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Browse pull requests from every repository connected to your
                GitHub App.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              <strong className="text-slate-200">{pullRequests.length}</strong>{" "}
              {pullRequests.length === 1 ? "pull request" : "pull requests"}
            </div>
          </header>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories"
                aria-label="Search repositories"
                className="border-slate-800 bg-slate-900/60 pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid gap-3" aria-label="Loading pull requests">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl border border-slate-800/70 bg-slate-900/50"
                />
              ))}
            </div>
          )}

          {isError && (
            <Card className="border-rose-500/30 bg-rose-950/20 text-slate-200">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="size-5 text-rose-400" />
                <div>
                  <p className="font-medium">Could not load pull requests</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Check that your GitHub App is connected, then try again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void repositoriesQuery.refetch();
                    void pullRequestsQuery.refetch();
                  }}
                  className="ml-auto inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-sky-500/60 hover:text-sky-300"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && repositories.length === 0 && (
            <Card className="border-slate-800/80 bg-slate-900/35">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <GitPullRequest className="mb-4 size-8 text-slate-500" />
                <h2 className="font-medium text-slate-200">
                  {search
                    ? "No matching repositories"
                    : "No pull requests found"}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  {search
                    ? "Try a different repository name."
                    : "Pull requests opened after the GitHub App is connected will appear here."}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {!isLoading &&
              !isError &&
              repositories.map((repository) => {
                const repositoryPullRequests = pullRequests.filter(
                  (pullRequest) =>
                    pullRequest.repoFullName === repository.fullName,
                );
                const isOpen = openRepository === repository.fullName;

                return (
                  <Card
                    key={repository.id}
                    className="overflow-hidden border-slate-800/80 bg-slate-900/50 transition-colors hover:border-sky-500/35"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenRepository(isOpen ? null : repository.fullName)
                      }
                      className="flex w-full cursor-pointer flex-col gap-4 p-5 text-left outline-none transition-colors hover:bg-slate-900/65 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <GitBranch className="size-4 shrink-0 text-sky-400" />
                          <span className="truncate font-semibold text-slate-100">
                            {repository.fullName}
                          </span>
                          <Badge className="border border-sky-500/25 bg-sky-500/10 text-sky-300">
                            {repositoryPullRequests.length} PR
                            {repositoryPullRequests.length === 1 ? "" : "s"}
                          </Badge>
                        </span>
                        <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <GitBranch className="size-3.5 text-slate-500" />
                            {repository.branches} branches
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <GitCommitHorizontal className="size-3.5 text-slate-500" />
                            {repository.commits} commits
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-slate-500 transition-transform ${
                          isOpen ? "rotate-180 text-sky-400" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-800/80 px-5 py-4">
                        <div className="grid gap-2">
                          {repositoryPullRequests.map((pullRequest) => (
                            <button
                              type="button"
                              key={pullRequest.id}
                              onClick={() =>
                                setSelectedPullRequest(pullRequest)
                              }
                              className="flex w-full cursor-pointer flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-left transition-colors hover:border-sky-500/40 hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0">
                                <h2 className="truncate font-medium text-slate-200">
                                  <span className="mr-2 text-sky-400">
                                    #{pullRequest.prNumber}
                                  </span>
                                  {pullRequest.title}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                  {pullRequest.authorLogin
                                    ? `by ${pullRequest.authorLogin} on `
                                    : "Opened on "}
                                  {new Date(
                                    pullRequest.createdAt,
                                  ).toLocaleDateString()}
                                  <span className="mx-2 text-slate-700">|</span>
                                  base: {pullRequest.baseBranch}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="w-fit border-slate-700 text-slate-400"
                              >
                                {pullRequest.status}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>
      </QuietInteractiveBackdrop>

      <Dialog
        open={selectedPullRequest !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPullRequest(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-8 text-lg text-white">
              {selectedPullRequest
                ? `#${selectedPullRequest.prNumber} ${selectedPullRequest.title}`
                : "Pull request"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPullRequest?.repoFullName}
            </DialogDescription>
          </DialogHeader>

          {pullRequestDetailsQuery.isPending && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="size-4 animate-spin text-sky-400" />
              Loading pull request summary...
            </div>
          )}

          {pullRequestDetailsQuery.isError && (
            <p className="text-sm text-rose-300">
              Could not load the pull request summary. Try again from GitHub.
            </p>
          )}

          {pullRequestDetailsQuery.data && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <Badge variant="outline" className="border-slate-700">
                  {pullRequestDetailsQuery.data.state}
                </Badge>
                <span className="rounded-md border border-slate-800 px-2 py-1">
                  +{pullRequestDetailsQuery.data.additions} additions
                </span>
                <span className="rounded-md border border-slate-800 px-2 py-1">
                  -{pullRequestDetailsQuery.data.deletions} deletions
                </span>
                <span className="rounded-md border border-slate-800 px-2 py-1">
                  {pullRequestDetailsQuery.data.changedFiles} files changed
                </span>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-200">
                  Summary
                </h3>
                <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-400">
                  {pullRequestDetailsQuery.data.body ||
                    "No summary was provided for this pull request."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="items-stretch sm:items-center">
            <button
              type="button"
              onClick={() => setSelectedPullRequest(null)}
              className="inline-flex w-full items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!pullRequestDetailsQuery.data?.htmlUrl}
              onClick={() => {
                const url = pullRequestDetailsQuery.data?.htmlUrl;
                if (url) window.location.href = url;
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Navigate to the PR <ExternalLink className="size-4" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PullRequests;
