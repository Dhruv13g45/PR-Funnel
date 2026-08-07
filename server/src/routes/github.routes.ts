import { Router } from "express";
import {
  githubWebhookController,
  githubInstallationController,
  githubCallbackController,
  githubDisconnectController,
  getGithubInstallationStatusController,
} from "../controllers/github.controllers.js";

const router = Router();

router.post("/webhook", githubWebhookController);
router.get("/install-url", githubInstallationController);
router.get("/disconnect", githubDisconnectController);
router.get("/callback", githubCallbackController);
router.get("/installation-status", getGithubInstallationStatusController);

export default router;
