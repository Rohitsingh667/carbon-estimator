import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleEstimate } from "./routes/estimate";
import { handleEstimateImage, uploadMiddleware } from "./routes/estimateImage";
import { handleHealth } from "./routes/health";
import { handleTestUpload, testUploadMiddleware } from "./routes/testUpload";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/health", handleHealth);

  app.post("/api/estimate", handleEstimate);
  app.post("/api/estimate/image", uploadMiddleware, handleEstimateImage);

  app.post("/api/test-upload", testUploadMiddleware, handleTestUpload);

  return app;
}
