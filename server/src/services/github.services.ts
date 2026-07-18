import type { Request } from "express"
import { verifySignature } from "../utils/githubSignature.js"

export function githubWebhookService(req: Request) {

    const signature = req.headers["x-hub-signature-256"]

    const valid = verifySignature(signature as string, req.rawBody!)

    if (!valid) {
        throw new Error("Invalid Webhook signature")
    }


    return {
        processed: true
    }

}
