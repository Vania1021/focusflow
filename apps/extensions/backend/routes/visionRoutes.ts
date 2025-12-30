// apps/extensions/backend/routes/visionRoutes.ts
import express from 'express';
import ImageAnalysisClient, { isUnexpected } from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";
import Groq from 'groq-sdk';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Azure AI Vision 4.0 Configuration
const endpoint = process.env.AZURE_VISION_ENDPOINT || "";
const key = process.env.AZURE_VISION_KEY || "";
const createClient = (ImageAnalysisClient as any).default || ImageAnalysisClient;
const client = createClient(endpoint, new AzureKeyCredential(key));
const sanitize = (text: string) => text.replace(/[*#_~`>]/g, '').trim();

router.post('/ocr-explain', async (req: any, res: any) => {
    const { image } = req.body;
    try {
        const buffer = Buffer.from(image.split(',')[1], 'base64');
        const result = await client.path('/imageanalysis:analyze').post({
            body: buffer,
            queryParameters: { features: ['caption', 'read'] },
            contentType: 'application/octet-stream'
        });
        
        if (isUnexpected(result)) {
            throw result.body.error;
        }

        const ocrText = result.body.readResult?.blocks.map((b: any) => 
            b.lines.map((l: any) => l.text).join(' ')
        ).join('\n') || "No text detected.";

        const explanation = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ 
                role: "system", 
                content: "Explain this OCR text simply for ADHD. Use [DEF] for terms and [TASK] for actions. No markdown." 
            }, { 
                role: "user", content: `OCR Text: ${ocrText}` 
            }]
        });
        res.json({ reply: explanation.choices[0]?.message?.content || "" });
    } catch (error: any) {
        res.status(500).json({ error: "Azure Vision failed: " + error.message });
    }
});

// NEW: Chat about specific visual selection
router.post('/ocr-chat', async (req: any, res: any) => {
    const { message, ocrContext, history } = req.body;
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are an ADHD assistant. The user is asking about a specific part of a video they just selected. 
                    Selection Context: ${ocrContext}` 
                },
                ...history,
                { role: "user", content: message }
            ]
        });
        res.json({ reply: sanitize(response.choices[0]?.message?.content || "") });
    } catch (error) {
        res.status(500).json({ error: "Visual chat failed" });
    }
});

export default router;