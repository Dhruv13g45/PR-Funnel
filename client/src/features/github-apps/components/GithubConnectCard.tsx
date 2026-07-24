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
import {
  GitBranch,
  Plug,
  Link,
  Trash2,
  Loader2,
  Key,
  GitPullRequest,
  Bot,
} from "lucide-react";

import { api } from "@/lib/api";

const GithubConnectCard: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setConnected((c) => !c);
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!params) {
      setConnected(false);
    } else {
      const installed = params.get("installed");

      if (installed) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    }
  }, []);

  const handleInstallation = async () => {
    try {
      const response = await api.get("/github/install-url");
      window.location.href = await response?.data?.data;
    } catch (error: any) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log("URL:", error.config?.url);
      console.log("Base URL:", error.config?.baseURL);
    }
  };

  return (
    <Card
      className={`max-w-lg m-3 transition-all hover:shadow-lg ${
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
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
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

          <div>
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
