import { Router } from "express";
import {
  githubWebhookController,
  githubInstallationController,
  githubCallbackController,
  githubDisconnectController,
  getGithubInstallationStatusController,
  repositorySyncController,
  getRepositorySyncStatusController,
  getAllRepoController,
} from "../controllers/github.controllers.js";

const router = Router();

router.post("/webhook", githubWebhookController);
router.get("/install-url", githubInstallationController);
router.get("/disconnect", githubDisconnectController);
router.get("/callback", githubCallbackController);
router.get("/installation-status", getGithubInstallationStatusController);

router.get("/repositories", getAllRepoController);
router.post("/sync", repositorySyncController);
router.get("/sync/status", getRepositorySyncStatusController);

export default router;
