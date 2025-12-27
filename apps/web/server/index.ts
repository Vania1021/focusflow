import express from "express"
import dotenv from "dotenv";

import { connectDB } from "./lib/db.config";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());


app.listen(PORT, async () => {
    console.log(`Server Starting : http://localhost:${PORT}`);
    await connectDB();
})
