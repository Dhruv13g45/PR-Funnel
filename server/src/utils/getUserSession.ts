import { auth } from "../lib/auth.js";

export async function getUserSession(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    throw new Error("No session found");
  }

  const userId = session?.user?.id;

  return userId;
}
