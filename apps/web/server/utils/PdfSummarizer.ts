import { Content_outputsContainer } from "../lib/db.config.js";
import { downloadBlobAsBuffer } from "../utils/blobDownloadHelper.js";
import { processTextWorker } from "./process.text.worker.js";
import { getUserPreferences } from "./getUserPreference.js";
import { OutputStyle } from "../types/textprocessing.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Note: Using gemini-1.5-flash as it is stable for PDF processing
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

/**
 * NEW: Convert text into ADHD-friendly Bionic Reading JSON 
 * (Restored to fix your import error)
 */
export const generateBionicJSON = async (
  summary: string,
  preferences: any
): Promise<any> => {
  const prompt = `
Convert the following text into ADHD-friendly Bionic Reading JSON.

Rules:
1. Bold the first 40% of each word using <b></b> tags.
2. Keep sentences short and concise.
3. Return STRICT JSON following the format below.

JSON FORMAT:
{
  "paragraphs": [
    { "sentences": [{ "text": "<b>Thi</b>s is an <b>exa</b>mple." }] }
  ]
}

TEXT TO CONVERT:
${summary}
`;

  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText);
};

/**
 * Process PDF by sending it directly to Gemini
 */
export const processPDFInBackground = async ({
  contentId,
  userId,
  outputStyle,
  initialResource,
}: {
  contentId: string;
  userId: string;
  outputStyle: OutputStyle;
  initialResource?: any;
}) => {
  try {
    let resource = initialResource;

    if (!resource) {
      const { resource: dbResource } =
        await Content_outputsContainer.item(contentId, userId).read();
      resource = dbResource;
    }

    if (!resource) throw new Error("Content output not found");

    // 1️⃣ Download PDF
    const pdfBuffer = await downloadBlobAsBuffer(resource.rawStorageRef);
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length < 100) {
      throw new Error("Uploaded PDF is invalid or empty");
    }

    // 2️⃣ Prepare Data for Gemini (No pdf-js needed!)
    const base64PDF = pdfBuffer.toString("base64");
    const preferences = await getUserPreferences(userId);

    // 3️⃣ Extract Text via Gemini
    const extractPrompt = "Extract all text from this PDF accurately. Maintain logical structure.";
    
    const result = await geminiModel.generateContent([
      {
        inlineData: {
          data: base64PDF,
          mimeType: "application/pdf",
        },
      },
      { text: extractPrompt },
    ]);

    const extractedText = result.response.text();

    // 4️⃣ Continue to processing worker
    await processTextWorker({
      contentId,
      userId,
      outputStyle,
      text: extractedText,
      preferences,
    });

  } catch (error: any) {
    console.error(`[PDFSummarizer] FATAL ERROR`, error);
    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "FAILED" },
      { op: "set", path: "/errorMessage", value: error.message || "PDF processing failed" },
    ]);
  }
};