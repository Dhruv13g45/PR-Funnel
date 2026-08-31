import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface SyncRepositoryPayload {
  owner: string;
  repo: string;
}

export function useSyncRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, repo }: SyncRepositoryPayload) => {
      const { data } = await api.post("/github/sync", {
        owner,
        repo,
      });

      return data;
    },

    onMutate: async ({ owner, repo }) => {
      const toastId = toast.loading(`Syncing ${owner}/${repo}...`, {
        description: "PR-Funnel is indexing the repository in the background.",
      });

      return { toastId };
    },

    onSuccess: (_data, { owner, repo }, context) => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });

      toast.success("Sync started", {
        id: context?.toastId,
        description: `${owner}/${repo} is being indexed and will be ready shortly.`,
      });
    },

    onError: (error: any, { owner, repo }, context) => {
      toast.error("Failed to start repository sync", {
        id: context?.toastId,
        description:
          error?.response?.data?.message ??
          `Something went wrong while starting the sync for ${owner}/${repo}.`,
      });
    },
  });
}
