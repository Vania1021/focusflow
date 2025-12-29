import crypto from "crypto";
import { Request, Response } from "express";
import { Content_outputsContainer } from "../lib/db.config";

export const createContentOutput = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { inputType, rawStorageRef } = req.body;

  if (!inputType || !rawStorageRef) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const contentId = crypto.randomUUID();

  await Content_outputsContainer.items.create({
    id: contentId,
    contentId,
    userId,
    inputType,
    rawStorageRef,
    status: "UPLOADED",
    createdAt: new Date().toISOString(),
    type: "CONTENT_OUTPUT",
  });

  res.status(201).json({
    contentId,
    status: "UPLOADED",
  });
};

export const getContentOutputById = async (req: Request, res: Response) => {
  const { contentId } = req.params;
  const userId = req.user.id;

  const { resource } =
    await Content_outputsContainer.item(contentId, userId).read();

  if (!resource) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({
    contentId: resource.contentId,
    status: resource.status,
    outputFormat: resource.outputFormat,
    processed:
      resource.status === "READY"
        ? {
            blobName: resource.processedBlobName,
            container: resource.processedContainerName,
          }
        : null,
    errorMessage: resource.errorMessage,
  });
};
