import crypto from "node:crypto";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import preferenceRoutes from "./routes/preferences.route";


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



const PORT = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // Allows your Vite frontend
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);


app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is reachable from Frontend", db: "Connected" });
});


app.listen(PORT, async () => {
    console.log(`Server Starting : http://localhost:${PORT}`);
    await connectDB();
})
