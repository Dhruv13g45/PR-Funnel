import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [watchingSync, setWatchingSync] = useState(false);

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

    if (syncStatusQuery.data?.status === "synced") {
      toast.success("Repository synced successfully", {
        description: `${owner}/${repo} is ready for AI reviews (${syncStatusQuery.data.chunkCount} code chunks indexed).`,
      });
      setWatchingSync(false);
    }

    if (syncStatusQuery.data?.status === "failed") {
      toast.error("Repository sync failed", {
        description: `PR Funnel could not finish indexing ${owner}/${repo}.`,
      });
      setWatchingSync(false);
    }
  }, [owner, repo, syncStatusQuery.data, watchingSync]);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={syncRepository.isPending || watchingSync}
      onClick={() =>
        syncRepository.mutate(
          { owner, repo },
          { onSuccess: () => setWatchingSync(true) },
        )
      }
      className="border-slate-700 bg-slate-950/60 text-slate-200 hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-300"
    >
      {syncRepository.isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw aria-hidden="true" />
      )}
      <span>{syncRepository.isPending || watchingSync ? "Syncing" : "Sync"}</span>
    </Button>
  );
};

export default SyncRepoButton;
