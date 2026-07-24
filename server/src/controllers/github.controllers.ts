import type { Request, Response } from "express";
import {
  githubInstallationService,
  githubWebhookService,
} from "../services/github.services.js";
import { githubWebhooks } from "../github/githubWebhook.js";
import {
  getInstallationDetails,
  saveInstallationDetails,
} from "../services/githubApp.services.js";
import { getUserSession } from "../utils/getUserSession.js";
import { generateGithubState, verifyGithuState } from "../utils/githubState.js";

// export function githubWebhookController(req: Request, res: Response) {
//   try {
//     const event = req.headers["x-github-event"] as string;

//     const data = githubWebhookService(event, req.body);

//     return res
//       .json({
//         message: "Verified webhook signature",
//         data: data,
//       })
//       .status(200);
//   } catch (error) {
//     return res.status(401).json({
//       message: "Invalid Webhook signature",
//     });
//   }
// }

export async function githubWebhookController(req: Request, res: Response) {
  try {
    await githubWebhooks.verifyAndReceive({
      id: req.headers["x-github-delivery"] as string,
      name: req.headers["x-github-event"] as string,
      signature: req.headers["x-hub-signature-256"] as string,
      payload: (req?.rawBody ?? "").toString(),
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }
}

export async function githubInstallationController(
  req: Request,
  res: Response,
) {
  const userId = await getUserSession(req as any);

  const state = generateGithubState(userId);

  const url: string = githubInstallationService(state);

  if (!url) {
    return res.status(500).json({
      message: "Cannot provide the github installation url",
    });
  }

  return res.status(200).json({
    message: "Got the installation url",
    data: url,
  });
}

export async function githubCallbackController(req: Request, res: Response) {
  console.log("Github callback");

  const installationId = Number(req.query.installation_id);

  console.log(installationId);

  const state = req.query.state as string;

  const payload = verifyGithuState(state);

  console.log(payload);

  const installFlag = await saveInstallationDetails(
    payload?.userId as string,
    installationId,
  );

  return res.redirect(
    `http://localhost:5173/github-apps?installed=${installFlag}`,
  );
}
