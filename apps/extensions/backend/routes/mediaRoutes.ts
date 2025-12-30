import express from 'express';
import multer from 'multer';
import fs from 'fs';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

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

// --- ROUTE 2: SMART NUGGETS (Gemini 2.5 Flash) ---

router.get('/meeting-summary', async (req: any, res: any) => {
    const { format } = req.query; // 'bullets', 'para', or 'flowchart'
    
    if (meetingTranscript.trim().length < 50) {
        return res.json({ reply: "Listening for context...", fullTranscript: meetingTranscript });
    }

    console.log(`FocusFlow: Generating ${format || 'bulleted'} summary using Groq...`);

    try {
        const groq = getGroqClient();
        
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are an ADHD study coach. Format the lecture into a structured list.
                    STRICT FORMATTING RULES:
                    1. NO markdown symbols (*, #, **).
                    2. Use EXACTLY two newlines between every point for spacing.
                    3. Use [TASK] before any assignment or deadline.
                    4. Use [DEF] before any new term or definition.
                    5. Use [KEY] for the single most important concept.
                    6. If format is 'flowchart', provide a numbered step-by-step logic list instead of bullets.
                    7. The bullets must be short like 15 words atmost per bullet` 
                },
                { 
                    role: "user", 
                    content: `Lecture Context: ${meetingTranscript.slice(-5000)}` 
                }
            ],
            temperature: 0.3 // Lower temperature ensures stricter adherence to formatting rules
        });

        const rawReply = response.choices[0]?.message?.content || "";
        const cleanReply = sanitizeADHD(rawReply);

        res.json({ reply: cleanReply, fullTranscript: meetingTranscript });
    } catch (err: any) {
        console.error("FocusFlow: Groq Summary Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
// router.get('/meeting-summary', async (req: any, res: any) => {
//     const { format } = req.query; // 'bullets', 'para', or 'flowchart'
    
//     if (meetingTranscript.trim().length < 50) {
//         return res.json({ reply: "Still listening to gather context...", fullTranscript: meetingTranscript });
//     }

//     console.log(`FocusFlow: Generating ${format || 'bulleted'} summary...`);

//     try {
//         const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
//         const prompt = `
//         You are an ADHD study coach. Format the lecture into a structured list.
//         STRICT FORMATTING RULES:
//         1. NO markdown symbols (*, #, **).
//         2. Use EXACTLY two newlines between every point for spacing.
//         3. Use [TASK] before any assignment or deadline.
//         4. Use [DEF] before any new term or definition.
//         5. Use [KEY] for the single most important concept.
//         Context: ${meetingTranscript.slice(-5000)}
//     `;

//         const result = await model.generateContent(prompt);
//         const cleanReply = sanitizeADHD(result.response.text());

//         res.json({ reply: cleanReply, fullTranscript: meetingTranscript });
//     } catch (err: any) {
//         console.error("FocusFlow: Summary Error:", err.message);
//         res.status(500).json({ error: err.message });
//     }
// });

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
                    content: `You are an ADHD Assistant. Provide short, structured, plain-text answers in bullet points such that they are ADHD - friendly. 
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

router.post('/generate-quiz', async (req: any, res: any) => {
    const { context } = req.body;
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ 
            role: "system", 
            content: "Generate ONE short, challenging active recall question based on this lecture segment. Keep it under 20 words." 
        }, { 
            role: "user", content: context }]
    });
    res.json({ question: response.choices[0]?.message?.content || "What was the main point just discussed?" });
});

// Azure Video Indexer Token Logic
async function getVIAuthToken() {
    const url = `https://api.videoindexer.ai/auth/${process.env.AZURE_REGION}/Accounts/${process.env.AZURE_VIDEO_INDEXER_ID}/AccessToken?allowEdit=true`;
    const res = await axios.get(url, { headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_VIDEO_INDEXER_KEY } });
    return res.data;
}

router.get('/topic-check', async (req: any, res: any) => {
    try {
        const token = await getVIAuthToken();
        // Fetch real-time insights from Video Indexer
        const viRes = await axios.get(
            `https://api.videoindexer.ai/${process.env.AZURE_REGION}/Accounts/${process.env.AZURE_VIDEO_INDEXER_ID}/Videos/${req.query.videoId}/Index?accessToken=${token}`
        );
        const topics = viRes.data.summarizedInsights?.topics || [];
        res.json({ currentTopic: topics[topics.length - 1]?.name || "General" });
    } catch (err) { res.status(500).send("Indexer error"); }
});

// Mermaid Shredder (using Groq for logic generation)
router.post('/shredder', async (req: any, res: any) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: "Convert transcript to Mermaid graph TD code. ONLY return code." },
                   { role: "user", content: req.body.transcript }]
    });
    res.json({ mermaidCode: response.choices[0]?.message?.content });
});

export default router;