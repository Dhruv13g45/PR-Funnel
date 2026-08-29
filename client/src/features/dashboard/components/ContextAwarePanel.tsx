import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileCode2,
  GitBranch,
  Layers3,
} from "lucide-react";

interface ContextAwarePanelProps {
  repositories: {
    repoFullName: string;
    branch?: string;
    chunkCount?: number;
  }[];
  pullRequests: { repoFullName: string; title: string; prNumber: number }[];
}

const ContextAwarePanel = ({
  repositories,
  pullRequests,
}: ContextAwarePanelProps) => {
  const [expanded, setExpanded] = useState(0);
  const repository = repositories[expanded] ?? repositories[0];
  const relatedPR = pullRequests.find(
    (pr) => pr.repoFullName === repository?.repoFullName,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
      <div className="border-b border-slate-800/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
              <Layers3 className="size-3.5" /> Context-aware
            </div>
            <h2 className="font-semibold text-white">
              Your reviews understand the code around the change.
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500">
              Repositories are indexed into searchable code context, so findings
              are grounded in the files your pull request actually touches.
            </p>
          </div>
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300 sm:flex">
            <FileCode2 className="size-5" />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-slate-800/80 p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Indexed repositories
          </p>
          <div className="space-y-1">
            {repositories.length === 0 ? (
              <p className="px-2 py-6 text-xs text-slate-500">
                Connect a repository to build context.
              </p>
            ) : (
              repositories.map((repo, index) => (
                <button
                  type="button"
                  key={repo.repoFullName}
                  onClick={() => setExpanded(index)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${index === expanded ? "bg-sky-400/10 text-sky-200" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}
                >
                  <GitBranch className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {repo.repoFullName}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {repo.chunkCount ?? 0}
                  </span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${index === expanded ? "-rotate-90 text-sky-400" : ""}`}
                  />
                </button>
              ))
            )}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Active context
              </p>
              <h3 className="mt-2 truncate text-lg font-semibold text-slate-100">
                {repository?.repoFullName ?? "Waiting for repository"}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Ready
            </span>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Branch
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                <GitBranch className="size-3.5 text-sky-400" />{" "}
                {repository?.branch ?? "main"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Code context
              </p>
              <p className="mt-2 text-xs text-slate-300">
                {repository?.chunkCount ?? 0} searchable chunks
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Related change
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {relatedPR
                ? `#${relatedPR.prNumber} · ${relatedPR.title}`
                : "No recent pull request for this repository"}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{" "}
              Context available for analysis
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContextAwarePanel;
