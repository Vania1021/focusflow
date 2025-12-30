import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();
const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/explain', async (req: any, res: any) => {
    const { context, messages } = req.body;
    try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: "You are an ADHD study coach. Explain the following text simply, using bold terms for key concepts: " + context 
                },
                ...messages
            ],
            temperature: 0.5
        });
        res.json({ reply: response.choices[0]?.message?.content });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;