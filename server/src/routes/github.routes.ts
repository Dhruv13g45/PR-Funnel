import { Router } from "express";
import { githubWebhookController } from "../controllers/github.controllers.js";


const router = Router()


router.post("/webhook", githubWebhookController)


export default router