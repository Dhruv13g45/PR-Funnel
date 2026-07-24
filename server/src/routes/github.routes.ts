import { Router } from "express";
import {
  githubWebhookController,
  githubInstallationController,
  githubCallbackController,
} from "../controllers/github.controllers.js";

const router = Router();

router.post("/webhook", githubWebhookController);
router.get("/install-url", githubInstallationController);
router.get("/callback", githubCallbackController);

export default router;
