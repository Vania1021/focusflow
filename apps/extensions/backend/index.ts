import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import mediaRoutes from './routes/mediaRoutes';
import chatRoutes from './routes/chatRoutes';

const app = express();


app.use(cors()); 
app.use(express.json());

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use('/media', mediaRoutes); // Handled by mediaRoutes.ts
app.use('/chat', chatRoutes);   // Handled by chatRoutes.ts

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`FocusFlow Backend running on http://localhost:${PORT}`);
    
    // Safety check for keys
    if (!process.env.GROQ_API_KEY || !process.env.GEMINI_API_KEY) {
        console.warn("WARNING: One or more API keys are missing in .env!");
    }
});