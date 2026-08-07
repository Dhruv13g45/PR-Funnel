import { prisma } from "../db/db.js";
import { githubApp } from "../github/githubApp.js";

export async function getInstallationOctokit(installationId: number) {
  return await githubApp.getInstallationOctokit(installationId);
}

export async function getInstallationDetails(installationId: number) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  const { data } = await octokit.request(
    "GET /app/installations/{installation_id}",
    {
      installation_id: installationId,
    },
  );

  return data;
}

export async function saveInstallationDetails(
  userId: string,
  installationId: number,
) {
  const installationDetails = await getInstallationDetails(installationId);
  const account = installationDetails.account as
    | { login?: string; type?: string }
    | { name?: string; slug?: string }
    | null;

  const accountLogin = account && "login" in account ? account.login : null;
  const accountType = account && "type" in account ? account.type : null;

  try {
    await prisma.githubInstallation.upsert({
      where: {
        userId,
      },
      update: {
        installationId: installationDetails?.id,
        accountLogin,
        accountType,
      },
      create: {
        userId,
        installationId: installationDetails?.id,
        accountLogin,
        accountType,
      },
    });

    return {
      userPayload: {
        userId,
      },
      installed: true,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function githubDisconnectService(userId: string) {
  if (userId) {
    const installation = await prisma.githubInstallation.findUnique({
      where: {
        userId,
      },
    });

    if (!installation) {
      console.log("No installation found");
      return null;
    }

    const installationId = Number(installation.installationId);

    if (installationId) {
      try {
        await githubApp.octokit.request(
          "DELETE /app/installations/{installation_id}",
          {
            installation_id: installationId,
          },
        );

        await prisma.githubInstallation.delete({
          where: {
            userId,
          },
        });

        return {
          message: "Installtion deleted",
          success: true,
        };
      } catch (error) {
        console.log(error);
        return error;
      }
    } else {
      return {
        message: "no installation id found",
        success: false,
      };
    }
  }
  return {
    message: "no user id found",
    success: false,
  };
}

export async function getPullRequestFiles(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
) {
  const octokit = await githubApp.getInstallationOctokit(installationId);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
    },
  );

  return data;
}