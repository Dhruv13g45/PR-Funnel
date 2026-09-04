import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

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
    },
  });
}
