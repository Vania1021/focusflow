import axios from "axios";
import { uploadToBlob } from "../lib/blob.config.js";
import {
  Content_outputsContainer,
  PreferencesContainer,
} from "../lib/db.config.js";
import { downloadBlobAsBuffer } from "../utils/blobDownloadHelper.js";
import { processTextWorker } from "./process.text.worker.js";
import { getUserPreferences } from "./getUserPreference.js";
import { OutputStyle } from "../types/textprocessing.js";

// ❗ IMPORT UPDATED TO .mjs FOR VERSION 5.x
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { GoogleGenerativeAI } from "@google/generative-ai";

/* ------------------------------------------------------------------ */
/* 🔧 Normalize pdfjs for ESM + Vercel (NO IMPORT CHANGE)              */
/* ------------------------------------------------------------------ */
const PDFJS: any = (pdfjsLib as any).default ?? pdfjsLib;

/* ------------------------------------------------------------------ */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

/**
 * Chunk long text
 */
export const chunkText = (text: string, chunkSize = 3000): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
};

/**
 * ✅ Extract text from PDF (Node-safe, Vercel-safe)
 */
export const extractTextFromPDF = async (
  pdfBuffer: Buffer
): Promise<string> => {
  if (!pdfBuffer || pdfBuffer.length < 100) {
    throw new Error("Invalid or empty PDF buffer");
  }

  // ✅ Disable workers (Vercel-safe)
  PDFJS.GlobalWorkerOptions.workerSrc = undefined;
  PDFJS.disableWorker = true;

  const data = new Uint8Array(pdfBuffer);

  const loadingTask = PDFJS.getDocument({
    data,
    disableWorker: true, // extra safety
  });

  const pdfDocument = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");

    fullText += pageText + "\n";
  }

  if (!fullText.trim()) {
    throw new Error("PDF contains no extractable text");
  }

  return fullText;
};

/**
 * Convert summary to Bionic Reading JSON
 */
export const generateBionicJSON = async (
  summary: string,
  preferences: any
): Promise<any> => {
  const prompt = `
Convert text into ADHD-friendly Bionic Reading JSON.

Rules:
- Bold first 40% of each word using <b></b>
- Keep sentences short
- Use strong structure
- Return STRICT JSON ONLY

JSON FORMAT:
{
  "paragraphs": [
    { "sentences": [{ "text": "<b>Thi</b>s is an <b>exa</b>mple." }] }
  ]
}

TEXT:
${summary}
`;

  const result = await geminiModel.generateContent(prompt);
  return JSON.parse(result.response.text());
};

/**
 * Background PDF processor
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

    if (!resource) {
      throw new Error("Content output not found");
    }

    console.log(
      `[PDFSummarizer] Loaded contentId=${contentId}, outputStyle=${outputStyle}`
    );

    // 1️⃣ Download PDF
    const pdfBuffer = await downloadBlobAsBuffer(resource.rawStorageRef);

    console.log(
      `[PDF Worker] Downloaded PDF. Size=${pdfBuffer?.length}`
    );

    // 2️⃣ Extract text
    const extractedText = await extractTextFromPDF(pdfBuffer);

    // 3️⃣ Get preferences
    const preferences = await getUserPreferences(userId);

    // 4️⃣ Delegate to text worker
    await processTextWorker({
      contentId,
      userId,
      outputStyle,
      text: extractedText,
      preferences,
    });

    console.log(
      `[PDFSummarizer] Worker dispatched for contentId=${contentId}`
    );
  } catch (error: any) {
    console.error(
      `[PDFSummarizer] FATAL ERROR for contentId=${contentId}`,
      error
    );

    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "FAILED" },
      {
        op: "set",
        path: "/errorMessage",
        value: error.message || "PDF processing failed",
      },
    ]);
  }
};
