import express from 'express';
import multer from 'multer';
import fs from 'fs';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize Clients
const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

let meetingTranscript = "";


//  ADHD Sanitizer: Removes all Markdown noise (*, #, _, **) 
//  to provide "naked text" and prevent visual overstimulation.

const sanitizeADHD = (text: string) => {
    return text
        .replace(/\*\*/g, '')      // Remove markdown bold
        .replace(/[*#_~`>]/g, '')  // Remove other special MD symbols
        .replace(/\n\s*\n/g, '\n\n') // Normalize spacing for better focus
        .trim();
};

// --- ROUTE 1: AUDIO PROCESSING (Live Feed) ---
router.post('/process-audio', upload.single('audio'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            console.log("FocusFlow: No audio chunk received.");
            return res.status(400).json({ error: "No audio" });
        }

        // Terminal Log: Listening Status
        console.log(`FocusFlow: Listening... Received chunk (${req.file.size} bytes).`);

        const groq = getGroqClient();
        const newPath = req.file.path + '.webm';
        fs.renameSync(req.file.path, newPath);
        
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(newPath),
            model: "whisper-large-v3-turbo",
            response_format: "json",
        });
        
        fs.unlinkSync(newPath);
        const text = transcription.text.trim();
        
        if (text) {
            meetingTranscript += " " + text;
            // Terminal Log: Processing Status
            console.log(`FocusFlow: Processed text: "${text.substring(0, 50)}..."`);
        } else {
            console.log("FocusFlow: Silence detected in audio segment.");
        }
        
        res.json({ text: text, fullTranscript: meetingTranscript });
    } catch (error: any) {
        console.error("FocusFlow: Transcription Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- ROUTE 2: SMART NUGGETS (Gemini 1.5 Flash) ---
router.get('/meeting-summary', async (req: any, res: any) => {
    const { format } = req.query; // 'bullets', 'para', or 'flowchart'
    
    if (meetingTranscript.trim().length < 50) {
        return res.json({ reply: "Still listening to gather context...", fullTranscript: meetingTranscript });
    }

    console.log(`FocusFlow: Generating ${format || 'bulleted'} summary...`);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
            You are an ADHD study coach. Format the following lecture into CLEAR, SHORT BULLET POINTS.
            STRICT RULES:
            1. DO NOT use any markdown characters (*, #, _, etc.).
            2. Use plain text only.
            3. Each point must be a single, scannable line.
            4. If the user wants a flowchart, provide it as a numbered step-by-step logic list.
            Lecture Context: ${meetingTranscript.slice(-5000)}
        `;

        const result = await model.generateContent(prompt);
        const cleanReply = sanitizeADHD(result.response.text());

        res.json({ reply: cleanReply, fullTranscript: meetingTranscript });
    } catch (err: any) {
        console.error("FocusFlow: Summary Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE 3: ASSISTANT CHAT (Groq / Llama 3) ---
router.post('/meet-chat', async (req: any, res: any) => {
    const { message, history } = req.body;
    
    console.log("FocusFlow: Assistant processing user query...");

    try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are an ADHD Assistant. Provide short, structured, plain-text answers. 
                    NEVER use markdown symbols like * or #. Use the following lecture context: 
                    ${meetingTranscript.slice(-3000)}` 
                },
                ...history,
                { role: "user", content: message }
            ]
        });

        const cleanReply = sanitizeADHD(response.choices[0]?.message?.content || "");
        console.log("FocusFlow: Assistant response generated.");
        
        res.json({ reply: cleanReply });
    } catch (error: any) {
        console.error("FocusFlow: Chat Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;