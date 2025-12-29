import { Request, Response } from "express";
import axios from "axios";
import { Content_outputsContainer } from "../lib/db.config";
import { processPDFToBionic } from "../utils/textsummarizer";
import { downloadBlobAsBuffer } from "../utils/blobdownloadhealper";

/**
 * Trigger PDF → Bionic processing
 * POST /api/process/pdf/:contentId
 */
  

// export const triggerPDFProcessing = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { contentId } = req.params;
//     const userId = req.user.id;
//     console.log("🔥🔥🔥 PROCESSING ROUTE HIT 🔥🔥🔥");


//     /** 1️⃣ Fetch content_outputs */
//     const { resource } =
//       await Content_outputsContainer.item(contentId, userId).read();

//     if (!resource) {
//       return res.status(404).json({ message: "Content output not found" });
//     }

//     if (resource.status === "PROCESSING") {
//       return res.status(400).json({ message: "Processing already started" });
//     }

//     /** 2️⃣ Mark status = PROCESSING */
//     resource.status = "PROCESSING";
//     await Content_outputsContainer
//       .item(contentId, userId)
//       .replace(resource);

//     /** 3️⃣ Download raw PDF from Blob */
//     console.log("📄 Downloading PDF from Blob...");

//     const pdfBuffer = await downloadBlobAsBuffer(resource.rawStorageRef);

//     console.log("✅ PDF downloaded. Size:", pdfBuffer.length);


//     /** 4️⃣ Start processing (service call) */
//     await processPDFToBionic({
//       contentId,
//       userId,
//       pdfBuffer,
//     });

//     /** 5️⃣ Respond immediately */
//     res.status(202).json({
//       message: "PDF processing started",
//       contentId,
//     });
//   } catch (error: any) {
//     console.error("[Processing Trigger Error]", error.message);

//     res.status(500).json({
//       message: "Failed to start PDF processing",
//     });
//   }
// };

export const triggerPDFProcessing = async (req: Request , res : Response) => {
  console.log("🔥🔥🔥 PROCESSING ROUTE HIT 🔥🔥🔥");

  try {
    const { contentId } = req.params;
    const userId = req.user.id;

    console.log("1️⃣ contentId:", contentId);
    console.log("2️⃣ userId:", userId);

    console.log("3️⃣ Reading content_outputs from Cosmos");
    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    console.log("4️⃣ Cosmos resource:", resource);

    if (!resource) {
      console.log("❌ No resource found");
      return res.status(404).json({ message: "Content not found" });
    }

    console.log("5️⃣ rawStorageRef:", resource.rawStorageRef);

    console.log("6️⃣ Downloading PDF from Blob");
    const pdfBuffer = await downloadBlobAsBuffer(resource.rawStorageRef);

    console.log("7️⃣ PDF downloaded, size:", pdfBuffer.length);

    console.log("8️⃣ Calling processPDFToBionic");
    await processPDFToBionic({
      contentId,
      userId,
      pdfBuffer,
    });

    console.log("9️⃣ Processing finished");

    return res.status(200).json({
      message: "PDF processed successfully",
    });
  } catch (error) {
    console.error("❌ PROCESSING ERROR:", error);
    return res.status(500).json({ message: "Processing failed" });
  }
};
