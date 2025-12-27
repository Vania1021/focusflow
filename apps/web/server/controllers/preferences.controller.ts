import { Request, Response } from "express";
import { PreferencesContainer } from "../lib/db.config";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Ensure variables are checked during startup
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const azureKey = process.env.AZURE_OPENAI_KEY || "";

const aiClient = new OpenAIClient(
  endpoint,
  new AzureKeyCredential(azureKey)
);

export const saveUserPreferences = async (req: Request, res: Response) => {
  try {
    const preferencesData = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";

    console.log(`[AI-Foundry] Attempting deployment: ${deploymentId}`);

    const systemPrompt = `Analyze study habits for ADHD. Return JSON ONLY: { "adhdLevel": 1-5, "focusIntensity": "string", "sensoryNeeds": [], "recommendedPomodoro": number }`;

    const aiResponse = await aiClient.getChatCompletions(deploymentId, [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(preferencesData) }
    ]);

    const rawContent = aiResponse.choices[0].message?.content || "{}";
    const evaluation = JSON.parse(rawContent);

    const finalRecord = {
      id: user.id,
      userId: user.id,
      ...preferencesData,
      aiEvaluation: evaluation,
      lastEdit: new Date().toISOString()
    };

    await PreferencesContainer.items.upsert(finalRecord);
    res.status(200).json({ success: true, evaluation });

  } catch (error: any) {
    // Enhanced logging to capture "undefined" errors
    console.error("--- AZURE AI ERROR DEBUG ---");
    console.error("Error Object:", JSON.stringify(error, null, 2));
    console.error("Error Message:", error?.message || "No message property");
    console.error("Stack Trace:", error?.stack);
    console.log("Current Endpoint:", endpoint);
    console.log("Current Deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    console.error("---------------------------");

    res.status(500).json({ 
      error: "Failed to process AI reasoning", 
      details: error?.message || "Connection refused or invalid credentials" 
    });
  }
};