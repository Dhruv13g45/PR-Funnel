import express, { type RequestHandler } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import githubRouter from "./routes/github.routes.js";
import { inngestServe } from "./inngest/serve.js";
import { getDashboardInfoController } from "./controllers/dashboard.controllers.js";

const app = express();

app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(
  express.json({
    verify: (req: any, res, buffer) => {
      req.rawBody = buffer;
    },
    limit: "10mb",
  }),
);

app.use("/health", (req, res) => {
  res.json({
    message: "Server is healthy",
  });
});

app.use("/api/github", githubRouter);

app.use(
  "/api/dashboard",
  getDashboardInfoController as unknown as RequestHandler,
);

app.use("/api/inngest", inngestServe);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server  listening on port ${PORT}`);
});
