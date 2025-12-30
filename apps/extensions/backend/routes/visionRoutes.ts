import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from 'groq-sdk';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sanitize = (text: string) => text.replace(/[*#_~`>]/g, '').trim();

// Endpoint for OCR and ADHD-friendly explanation
router.post('/ocr-explain', async (req: any, res: any) => {
    const { image, context } = req.body; // Base64 image from frontend
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // In a full implementation, you would first call Azure AI Vision here.
        // For Phase 2, we pipe the image data directly to Gemini's multimodal vision.
        const result = await model.generateContent([
            "Extract text from this image and explain it simply for a student with ADHD using bullet points. No markdown symbols.",
            { inlineData: { data: image.split(',')[1], mimeType: "image/jpeg" } }
        ]);

        res.json({ reply: sanitize(result.response.text()) });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for the Video Shredder (Mermaid flowchart)
router.post('/shredder', async (req: any, res: any) => {
    const { transcript } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Convert this lecture transcript into a Mermaid.js TD flowchart. 
        Return ONLY the mermaid code block starting with 'graph TD'. 
        Transcript: ${transcript.slice(-6000)}`;

        const result = await model.generateContent(prompt);
        res.json({ mermaidCode: result.response.text() });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;