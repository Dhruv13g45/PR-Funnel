import { serve } from "inngest/express";
import { inngestClient } from "./client.js";
import { prReviewPipeline } from "./functions/prReviewPipeline.js";

export const inngestServe = serve({
  client: inngestClient,
  functions: [prReviewPipeline],
});

console.log("inngest serve log demo");