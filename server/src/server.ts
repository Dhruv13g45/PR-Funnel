import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/health", (req, res) => {
  res.json({
    message: "Server is healthy",
    statusCode: 200,
  });
});

app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`);
});
