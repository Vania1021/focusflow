import crypto from "node:crypto";

// Professional polyfill to support Azure SDK in Node.js environments
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto as any;
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  // @ts-ignore
  globalThis.crypto.randomUUID = () => crypto.randomUUID();
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./lib/db.config";

dotenv.config();



const PORT = process.env.PORT;
const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Allows your Vite frontend
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is reachable from Frontend", db: "Connected" });
});


app.listen(PORT, async () => {
    console.log(`Server Starting : http://localhost:${PORT}`);
    await connectDB();
})
