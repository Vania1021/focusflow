import crypto from "node:crypto";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import preferenceRoutes from "./routes/preferences.route";
import contentOutputRoutes from "./routes/content_ouputs.routes";
import storageRoutes from "./routes/storage.routes";
import processingRoutes from "./routes/processing.routes";

import { connectDB } from "./lib/db.config";
// Professional polyfill to support Azure SDK in Node.js environments
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto as any;
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  // @ts-ignore
  globalThis.crypto.randomUUID = () => crypto.randomUUID();
}


dotenv.config();
import progressRoutes from "./routes/progress.routes";
import { checkBlobConnection } from "./lib/blob.config";


const PORT = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // Allows your Vite frontend
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/content-outputs", contentOutputRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/process", processingRoutes);


app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is reachable from Frontend", db: "Connected" });
});
app.use("/progress", progressRoutes);

app.listen(PORT, async () => {
    console.log(`Server Starting : http://localhost:${PORT}`);
    await connectDB();
    await checkBlobConnection();
})

