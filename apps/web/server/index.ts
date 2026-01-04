import "dotenv/config";
import crypto from "node:crypto";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables!");
}
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import preferenceRoutes from "./routes/preferences.route.js";
import contentOutputRoutes from "./routes/content_outputs.routes.js";
import storageRoutes from "./routes/storage.routes.js";
import videoRoutes from "./routes/video.routes.js";
import sessionRoutes from "./routes/session.route.js";
import quizRoutes from "./routes/quiz.route.js";

import { connectDB } from "./lib/db.config.js";
// Professional polyfill to support Azure SDK in Node.js environments
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto as any;
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  // @ts-ignore
  globalThis.crypto.randomUUID = () => crypto.randomUUID();
}
import progressRoutes from "./routes/progress.routes.js";
import { checkBlobConnection } from "./lib/blob.config.js";


const PORT = process.env.PORT;
const app = express();
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000", // dev
  "https://focusflow-uj1z.vercel.app", // deployed frontend
  "https://focusflow-red-beta.vercel.app", 
];

app.use(cors({
  origin: true, // Reflect origin back for debugging
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/content_outputs", contentOutputRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/content/video", videoRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/content", quizRoutes);
app.use("/api/session", sessionRoutes);


app.get("/", (req, res) => {
  res.json({ status: "ok", message: "FocusFlow API is running" });
});

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is reachable from Frontend", db: "Connected" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Error Handler]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

app.listen(PORT, async () => {
    console.log("Server Starting...");
    await connectDB();
    await checkBlobConnection();
});

export default app;
