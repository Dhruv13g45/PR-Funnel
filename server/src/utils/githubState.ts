import jwt from "jsonwebtoken";

const STATE: string = process.env.GITHUB_STATE_SECRET ?? "";
const EXPIRY: string = process.env.GITHUB_STATE_EXPIRY ?? "";

type Payload = {
  userId: string;
};

export function generateGithubState(userId: string) {
  const payload: Payload = { userId };

  // @ts-ignore
  return jwt.sign(payload, STATE, { expiresIn: EXPIRY });
}

export function verifyGithuState(token: string): Payload | null {
  try {
    const decoded = jwt.verify(token, STATE as jwt.Secret) as Payload;
    return decoded;
  } catch (e) {
    return null;
  }
}

console.log("New test pr log for different files");
