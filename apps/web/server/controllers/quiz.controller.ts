import { Request, Response } from "express";
import { generateMicroQuiz } from "../processors/quiz.processor";

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Content is required for quiz generation" });
    }

    console.log("[Quiz Controller] Requesting quiz from Groq processor...");
    const quiz = await generateMicroQuiz(content);

    if (!quiz) {
      return res.status(500).json({ message: "Failed to generate quiz" });
    }

    return res.status(200).json(quiz);
  } catch (error) {
    console.error("[Quiz Controller] Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};