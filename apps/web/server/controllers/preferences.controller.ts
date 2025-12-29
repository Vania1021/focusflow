import { Request, Response } from "express";
import { PreferencesContainer } from "../lib/db.config";
import { GoogleGenerativeAI } from "@google/generative-ai";


/*
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-06-01" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});
*/

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" } // Ensures valid JSON
});

export const saveUserPreferences = async (req: Request, res: Response) => {
  try {
    const preferencesData = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });

    console.log(`[Gemini-AI] Processing focus profile for user: ${user.id}`);

    const prompt = `
      Analyze these ADHD study habits and return a JSON object ONLY.
      Data: ${JSON.stringify(preferencesData)}
      Required Schema:
      {
        "adhdLevel": number (1-5),
        "focusIntensity": "low" | "moderate" | "high",
        "sensoryNeeds": string[],
        "recommendedPomodoro": number,
        "personalizedInsight": string
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const evaluation = JSON.parse(responseText);

    const finalRecord = {
      id: user.id, // Using userId as id to prevent duplication
      userId: user.id,
      ...preferencesData,
      aiEvaluation: evaluation,
      lastEdit: new Date().toISOString()
    };

    // Upsert ensures we update existing preferences for the same user
    await PreferencesContainer.items.upsert(finalRecord);
    
    console.log("Gemini reasoning saved successfully to Cosmos DB");
    res.status(200).json({ success: true, evaluation });

  } catch (error: any) {
    console.error("--- GEMINI AI ERROR ---");
    console.error(error.message);
    res.status(500).json({ 
      error: "Failed to process AI reasoning with Gemini", 
      details: error.message 
    });
  }
};

// Add this to the end of preferences.controller.ts

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Fetch preferences using the userId as the id/partition key
    const { resource } = await PreferencesContainer.item(user.id, user.id).read();

    if (!resource) {
      return res.status(404).json({ message: "No preferences found for this user" });
    }

    res.status(200).json(resource);
  } catch (error: any) {
    console.error(`[Fetch Preferences Error]: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to fetch preferences", 
      details: error.message 
    });
  }
};