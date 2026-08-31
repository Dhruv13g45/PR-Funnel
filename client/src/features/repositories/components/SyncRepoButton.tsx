import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSyncRepository } from "@/hooks/useSyncRepository";

interface SyncRepoButtonProps {
  owner: string;
  repo: string;
}

interface SyncStatusResponse {
  status: "pending" | "syncing" | "synced" | "failed";
  chunkCount: number;
}

const SyncRepoButton = ({ owner, repo }: SyncRepoButtonProps) => {
  const syncRepository = useSyncRepository();
  const queryClient = useQueryClient();
  const [watchingSync, setWatchingSync] = useState(false);
  const [syncToastId, setSyncToastId] = useState<string | number>();

  const syncStatusQuery = useQuery({
    queryKey: ["repository-sync", owner, repo],
    queryFn: async () => {
      const { data } = await api.get<SyncStatusResponse>(
        "/github/sync/status",
        { params: { owner, repo } },
      );
      return data;
    },
    enabled: watchingSync,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "synced" ||
      query.state.data?.status === "failed"
        ? false
        : 2000,
  });

  useEffect(() => {
    if (!watchingSync) return;

    const status = syncStatusQuery.data?.status;

    if (status === "pending" || status === "syncing") {
      toast.loading(
        status === "pending"
          ? `Preparing ${owner}/${repo}...`
          : `Syncing ${owner}/${repo}...`,
        {
          id: syncToastId,
          description:
            status === "pending"
              ? "The repository sync job is queued."
              : "PR-Funnel is indexing the repository. This window will stay locked until it finishes.",
          duration: Infinity,
          dismissible: false,
        },
      );
      return;
    }

    if (status === "synced") {
      toast.success("Repository synced successfully", {
        id: syncToastId,
        description: `${owner}/${repo} is ready for AI reviews (${syncStatusQuery.data?.chunkCount ?? 0} code chunks indexed).`,
      });
      setWatchingSync(false);
      setSyncToastId(undefined);
    }

    if (status === "failed") {
      toast.error("Repository sync failed", {
        id: syncToastId,
        description: `PR Funnel could not finish indexing ${owner}/${repo}.`,
      });
      setWatchingSync(false);
      setSyncToastId(undefined);
    }
  }, [owner, repo, syncStatusQuery.data, syncToastId, watchingSync]);

  const startSync = () => {
    queryClient.removeQueries({ queryKey: ["repository-sync", owner, repo] });

    const toastId = toast.loading(`Starting ${owner}/${repo}...`, {
      description: "Submitting the repository sync job.",
      duration: Infinity,
      dismissible: false,
    });
    setSyncToastId(toastId);

    syncRepository.mutate(
      { owner, repo },
      {
        onSuccess: () => setWatchingSync(true),
        onError: (error: any) => {
          toast.error("Failed to start repository sync", {
            id: toastId,
            description:
              error?.response?.data?.message ??
              `Something went wrong while starting the sync for ${owner}/${repo}.`,
          });
          setSyncToastId(undefined);
        },
      },
    );
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={syncRepository.isPending || watchingSync}
        onClick={startSync}
        className="border-slate-700 bg-slate-950/60 text-slate-200 hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-300"
      >
        {syncRepository.isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw aria-hidden="true" />
        )}
        <span>
          {syncRepository.isPending || watchingSync ? "Syncing" : "Sync"}
        </span>
      </Button>
      {(syncRepository.isPending || watchingSync) && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 cursor-wait bg-transparent"
        />
      )}
    </>
  );
};

export default SyncRepoButton;
