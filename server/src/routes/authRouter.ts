import express from "express";

const router = express.Router();

router.get("/ok", (req, res) => {
  res.json({
    message: "auth okay",
  });
});

export default router;
