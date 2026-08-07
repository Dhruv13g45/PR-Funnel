import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import githubRouter from "./routes/github.routes.js";
import { inngestServe } from "./inngest/serve.js";

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
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
  }),
);

app.use("/health", (req, res) => {
  res.json({
    message: "Server is healthy",
  });
});

app.use("/api/github", githubRouter);

app.use("/api/inngest", inngestServe);

app.use((req, res) => {
  console.log("404 HIT:", req.method, req.originalUrl);

  res.status(404).json({
    message: "Route not found",
  });
});

app.use((req, res, next) => {
  console.log("GLOBAL:", req.method, req.originalUrl);
  next();
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server  listening on port ${PORT}`);
});
