import type { Request, Response } from "express";
import { githubWebhookService } from "../services/github.services.js";

export function githubWebhookController(req: Request, res: Response) {

    try {
        const data = githubWebhookService(req);

        return res.json({
            message: "Verified webhook signature",
            data: data
        }).status(200);

    } catch (error) {
        return res.status(401).json({
            message: "Invalid Webhook signature"
        })
    }

}