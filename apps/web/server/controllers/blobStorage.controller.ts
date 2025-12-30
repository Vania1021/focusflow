/// <reference types="multer" />
import { Request, Response } from "express";
import { BlobSASPermissions } from "@azure/storage-blob";
import { uploadToBlob, getContainerClient } from "../lib/blob.config";
import { InputType } from "../models/content_outputs";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    console.log("[INFO]")
    console.log("[Upload File] Triggered");
    console.log("[INFO]")
    const file = req.file;
    const inputType = req.body.inputType as InputType;
    
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!inputType || !["audio", "video", "text"].includes(inputType)) {
      return res.status(400).json({ message: "Invalid or missing inputType" });
    }

    const {storageRef, blobName} = await uploadToBlob(file, inputType);

    res.status(200).json({
      message: "File uploaded successfully",
      storageRef,
      blobName,
      inputType,
    });
  } catch (error) {
    console.error("[storage] Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : error });
  }
};

export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    console.log("[INFO]")
    console.log("[GET Download URL] Triggered");
    console.log("[INFO]")
    const { blobName, inputType } = req.body as {
      blobName: string;
      inputType: InputType;
    };

    if (!blobName || !inputType) {
      return res.status(400).json({
        message: "Missing blobName or inputType",
      });
    }

    // ✅ Supports: text | audio | video | processed
    const containerClient = getContainerClient(inputType);
    if (!containerClient) {
      return res.status(400).json({
        message: "Invalid inputType",
      });
    }

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).json({ message: "Blob not found" });
    }

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    console.log("[INFO]")
    console.log("[GET Download URL] Success: ", sasUrl);
    console.log("[INFO]")
    res.status(200).json({ downloadUrl: sasUrl });
  } catch (error) {
    console.error("[storage] Retrieval error:", error);
    res.status(500).json({
      message: "Failed to generate download URL",
    });
  }
};

export const getBlobContent = async (req: Request, res: Response) => {
  try {
    console.log("[INFO]")
    console.log("[Get Blob Content] Triggered");
    console.log("[INFO]")
    const { blobName, inputType } = req.body as {
      blobName: string;
      inputType: InputType;
    };

    if (!blobName || !inputType) {
      return res.status(400).json({
        message: "Missing blobName or inputType",
      });
    }

    const containerClient = getContainerClient(inputType);
    if (!containerClient) {
      return res.status(400).json({
        message: "Invalid inputType",
      });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();

    if (!exists) {
      return res.status(404).json({ message: "Blob not found" });
    }

    const downloadBlockBlobResponse = await blockBlobClient.download();
    
    if (!downloadBlockBlobResponse.readableStreamBody) {
        return res.status(500).json({ message: "Failed to download blob" });
    }
    
    // Stream the content back to the client
    res.setHeader('Content-Type', downloadBlockBlobResponse.contentType || 'application/octet-stream');
    downloadBlockBlobResponse.readableStreamBody.pipe(res);

  } catch (error) {
    console.error("[storage] Content retrieval error:", error);
    res.status(500).json({
      message: "Failed to retrieve blob content",
    });
  }
};