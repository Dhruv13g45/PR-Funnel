import { auth } from "../lib/auth.js";

export async function getUserSession(req: Request) {
  // console.log("Full request", req);
  console.log("Only request headers", req.headers);
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    throw new Error("No session found");
  }

  const userId = session?.user?.id;

  return userId;
}
