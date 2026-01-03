import { groq, GROQ_MODEL } from "../utils/groq.client";

export const generateMicroQuiz = async (content: string) => {
  console.log("[Quiz Processor] Generating engagement check...");

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an ADHD learning assistant. Generate a 2-question micro-quiz. You MUST output ONLY valid JSON. No conversational text. Format: { \"questions\": [{ \"text\": \"string\", \"options\": [{ \"text\": \"string\", \"isCorrect\": boolean }] }] }"
        },
        {
          role: "user",
          content: `Content: ${content}`
        }
      ],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }, // Forces Groq to return JSON
      temperature: 0.5,
    });

    const rawResponse = chatCompletion.choices[0].message.content || "{}";
    
    // Robust parsing: extract JSON if Groq added extra text
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;

    const quizData = JSON.parse(cleanJson);
    console.log("[Quiz Processor] Quiz generated successfully");
    return quizData;
  } catch (error) {
    console.error("[Quiz Processor] Groq API or Parsing Error:", error);
    return null; // The controller should handle this null and send a 500
  }
};