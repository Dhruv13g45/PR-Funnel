import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertCircle,
  Code2,
  GitBranch,
  GitCommitHorizontal,
  LockKeyhole,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import QuietInteractiveBackdrop from "@/components/common/QuietInteractiveBackdrop";
import SyncRepoButton from "./SyncRepoButton";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  visibility: "private" | "public";
  defaultBranch: string;
  branches: number;
  commits: number;
  updatedAt: string | null;
}

interface RepositoriesResponse {
  repositories: Repository[];
}

const Repositories = () => {
  const [search, setSearch] = useState("");

  const repositoriesQuery = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data } = await api.get<RepositoriesResponse>(
        "/github/repositories",
      );
      return data.repositories;
    },
  });

  const repositories = repositoriesQuery.data ?? [];
  const filteredRepositories = repositories.filter((repository) =>
    `${repository.name} ${repository.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-full flex-1 overflow-y-auto bg-slate-950 text-slate-100">
      <QuietInteractiveBackdrop>
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-800/80 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
                <Server className="size-4" /> Workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Repositories
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Browse the repositories connected to your GitHub App and send
                one to PR Funnel for indexing.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-sky-400">
                <Code2 className="size-4" />
              </span>
              <span>
                <strong className="text-slate-200">
                  {repositories.length}
                </strong>{" "}
                connected{" "}
                {repositories.length === 1 ? "repository" : "repositories"}
              </span>
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
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Live
              from GitHub
            </div>
          </div>

          {repositoriesQuery.isPending && (
            <div className="grid gap-3" aria-label="Loading repositories">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl border border-slate-800/70 bg-slate-900/50"
                />
              ))}
            </div>
          )}

          {repositoriesQuery.isError && (
            <Card className="border-rose-500/30 bg-rose-950/20 text-slate-200">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="size-5 text-rose-400" />
                <div>
                  <p className="font-medium">Could not load repositories</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Check that your GitHub App is connected, then try again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => repositoriesQuery.refetch()}
                  className="ml-auto inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-sky-500/60 hover:text-sky-300"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              </CardContent>
            </Card>
          )}

          {!repositoriesQuery.isPending &&
            !repositoriesQuery.isError &&
            filteredRepositories.length === 0 && (
              <Card className="border-slate-800/80 bg-slate-900/35">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
                    <Code2 className="size-5" />
                  </div>
                  <h2 className="font-medium text-slate-200">
                    {search
                      ? "No matching repositories"
                      : "No repositories found"}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    {search
                      ? "Try a different repository name or description."
                      : "Install the GitHub App and grant it access to a repository to get started."}
                  </p>
                </CardContent>
              </Card>
            )}

          <div className="grid gap-3">
            {filteredRepositories.map((repository) => (
              <Card
                key={repository.id}
                className="border-slate-800/80 bg-slate-900/45 transition-colors hover:border-sky-500/30 hover:bg-slate-900/70"
              >
                <CardContent className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate font-semibold text-slate-100">
                        {repository.name}
                      </h1>
                      {repository.visibility === "private" && (
                        <Badge
                          variant="secondary"
                          className="gap-1 border border-slate-700 bg-slate-800/70 text-[11px] text-slate-300"
                        >
                          <LockKeyhole className="size-3" /> Private
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {repository.fullName}
                    </p>
                    <p className="mt-3 max-w-2xl truncate text-sm text-slate-400">
                      {repository.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <GitBranch className="size-3.5 text-sky-400" />{" "}
                        {repository.branches} branches
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <GitCommitHorizontal className="size-3.5 text-sky-400" />{" "}
                        {repository.commits} commits
                      </span>
                      {repository.updatedAt && (
                        <span className="text-slate-600">
                          Updated{" "}
                          {new Date(repository.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <SyncRepoButton
                    owner={repository.owner}
                    repo={repository.name}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </QuietInteractiveBackdrop>
    </main>
  );
};

export default Repositories;
