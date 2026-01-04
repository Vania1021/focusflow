import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import mediaRoutes from './routes/mediaRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import visionRoutes from './routes/visionRoutes.js';

const app = express();


app.use(cors()); 
// app.use(express.json());
app.use(express.json({ limit: '10mb' }));

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use('/media', mediaRoutes);
app.use('/chat', chatRoutes);   
app.use('/vision', visionRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`FocusFlow Backend running on http://localhost:${PORT}`);
    
    // Safety check for keys
    if (!process.env.GROQ_API_KEY || !process.env.GEMINI_API_KEY) {
        console.warn("WARNING: One or more API keys are missing in .env!");
    }
});