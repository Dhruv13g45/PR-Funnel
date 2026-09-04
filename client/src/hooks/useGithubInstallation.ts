import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const getGithubInstallationStatus = async () => {
  const { data } = await api.get("/github/installation-status");

  return data;
};

export function useGithubInstallation() {
  return useQuery({
    queryKey: ["github-installation"],
    queryFn: getGithubInstallationStatus,
  });
}
