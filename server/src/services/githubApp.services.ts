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
  const account = installationDetails.account as {
    login?: string;
    type?: string;
  } | null;

  try {
    await prisma.githubInstallation.create({
      data: {
        userId,
        installationId: installationId,
        accountLogin: account?.login ?? null,
        accountType: account?.type ?? null,
      },
    });

    return {
      installed: true,
    };
  } catch (error) {
    console.log(error);
  }

  //   save in db
  //    id String @id @default(cuid())
  //   userId String @unique
  //   user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  //   installationId BigInt
  //   accountLogin String?
  //   accountType String?
  //   createdAt     DateTime  @default(now())
  //   updatedAt     DateTime  @updatedAt

  //   and in user githubInstallation

  //   await prisma.gitHubInstallation.create({
  //     data: {
  //       installationId: installationId,
  //       userId: userId,
  //       accountLogin: installationDetails?.account?.login,
  //       accountType: installationDetails?.account?.type,
  //     },
  //   });
}
