import { serve } from "inngest/express";
import { inngestClient } from "./client.js";
import { prReviewPipeline } from "./functions/prReviewPipeline.js";
import { repoSyncPipeline } from "./functions/repositorySyncPipeline.js";

export const inngestServe = serve({
  client: inngestClient,
  functions: [prReviewPipeline, repoSyncPipeline],
});
