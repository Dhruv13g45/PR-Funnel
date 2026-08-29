import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plug, Trash2, Loader2, Key, GitPullRequest, Bot } from "lucide-react";
import { api } from "@/lib/api";
import { useGithubInstallation } from "@/hooks/useGithubInstallation";
import { useQueryClient } from "@tanstack/react-query";

interface InstallationStatusResponse {
  installed?: boolean;
}

const GithubConnectCard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data } = useGithubInstallation() as {
    data: InstallationStatusResponse | undefined;
  };

  const connected = data?.installed ?? false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("installed")) {
      queryClient.invalidateQueries({
        queryKey: ["github-installation"],
      });

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleInstallation = async () => {
    setLoading(true);

    try {
      if (connected) {
        const response = await api.get<{ success?: boolean }>(
          "/github/disconnect",
        );

        if (response.data.success) {
          await queryClient.invalidateQueries({
            queryKey: ["github-installation"],
          });
        }
      } else {
        const response = await api.get<{ data: string }>("/github/install-url");
        window.location.href = response.data.data;
      }
    } catch (error: any) {
      console.log("GitHub App action failed", error.response?.data ?? error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`m-3 w-full max-w-lg transition-all hover:shadow-lg ${
        connected
          ? "border border-sky-500/60 ring-1 ring-sky-500/8 bg-slate-900/25 shadow-[0_8px_30px_rgba(2,132,199,0.06)]"
          : "border border-slate-900/60 bg-slate-900/30"
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>GitHub App</CardTitle>
            <CardDescription>
              Connect your GitHub App to sync repositories and PR data.
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 ring-2 ring-background" />
                </span>
                <Badge className="px-3 py-0.5 border border-sky-500/50 bg-sky-500/8">
                  Connected
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-slate-700 ring-1 ring-background" />
                <Badge
                  variant="secondary"
                  className="px-3 py-0.5 border border-slate-800/40 bg-transparent"
                >
                  Not connected
                </Badge>
              </div>
            )}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-stretch justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0 text-sm text-muted-foreground">
            <p>
              {connected
                ? "App is installed and connected to your account."
                : "Install the GitHub App to enable repository sync and webhooks."}
            </p>

            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">
                  <Key className="size-4" />
                </span>
                <span>Access public & private repositories you select</span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">
                  <GitPullRequest className="size-4" />
                </span>
                <span>Receive webhooks for pull requests</span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-0.5">
                  <Bot className="size-4" />
                </span>
                <span>Post AI-generated reviews on pull requests</span>
              </li>
            </ul>
          </div>

          <div className="shrink-0 self-end sm:self-auto">
            <Button
              onClick={handleInstallation}
              size="sm"
              variant={connected ? "destructive" : "default"}
              aria-pressed={connected}
              disabled={loading}
              className={`cursor-pointer transform-gpu transition duration-150 ease-out hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400/40 ${
                connected
                  ? "border border-sky-500/60"
                  : "border border-slate-800/40"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  {connected ? "Disconnecting..." : "Connecting..."}
                </span>
              ) : connected ? (
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="size-4" /> Disconnect
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Plug className="size-4" /> Install App
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GithubConnectCard;
