/// <reference types="multer" />
import { Request, Response } from "express";
import { BlobSASPermissions } from "@azure/storage-blob";
import { uploadToBlob, getContainerClient } from "../lib/blob.config";
import { InputType } from "../models/content_outputs";

export const uploadFile = async (req: Request, res: Response) => {
  try {
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
    const { blobName, inputType } = req.body;
    
    console.log("Curr Req: ", req);

    if (!blobName || !inputType) {
      return res.status(400).json({ message: "Missing blobName or inputType" });
    }

    const containerClient = getContainerClient(inputType);
    if (!containerClient) return res.status(400).json({ message: "Invalid inputType" });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const exists = await blockBlobClient.exists();
    if (!exists) return res.status(404).json({ message: "Blob not found" });

    const sasToken = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
    });

    res.status(200).json({ downloadUrl: sasToken });
  } catch (error) {
    console.error("[storage] Retrieval error:", error);
    res.status(500).json({ message: "Failed to generate download URL" });
  }
};
