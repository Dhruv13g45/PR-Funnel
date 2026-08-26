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

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      toast.success("Repository sync started", {
        description:
          "PR-Funnel is now indexing the repository in the background.",
      });
    },

    onError: (error: any) => {
      toast.error("Failed to start repository sync", {
        description:
          error?.response?.data?.message ??
          "Something went wrong while starting the repository sync.",
      });
    },
  });
}
