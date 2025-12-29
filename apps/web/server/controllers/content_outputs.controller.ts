import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Content_outputs,
  InputType,
  ProcessingStatus,
  OutputFormat,
} from "../models/content_outputs";
import { Content_outputsContainer } from "../lib/db.config";
import { getContainerClient } from "../lib/blob.config";

/**
 * STEP 1 — Create content output after RAW upload
 * status = UPLOADED
 */
export const createContentOutput = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const { inputType, rawStorageRef } = req.body;

    if (!inputType || !rawStorageRef) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contentId = uuidv4();

    const contentOutput: Content_outputs = {
      id: contentId,
      contentId,
      userId,

      inputType: inputType as InputType,
      rawStorageRef,

      status: "UPLOADED",

      createdAt: new Date().toISOString(),
      type: "CONTENT_OUTPUT",
    };

    await Content_outputsContainer.items.create(contentOutput);

    res.status(201).json(contentOutput);
  } catch (error) {
    console.error("[content_outputs] create error:", error);
    res.status(500).json({ message: "Failed to create content output" });
  }
};

/**
 * STEP 2 — Mark processing started
 * status = PROCESSING
 */
export const markProcessing = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;

    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    if (!resource) {
      return res.status(404).json({ message: "Content output not found" });
    }

    resource.status = "PROCESSING";
    await Content_outputsContainer
      .item(contentId, userId)
      .replace(resource);

    res.status(200).json(resource);
  } catch (error) {
    console.error("[content_outputs] processing error:", error);
    res.status(500).json({ message: "Failed to mark processing" });
  }
};

/**
 * STEP 3 — Save processed output
 * status = READY
 */
export const markProcessingComplete = async (
  req: Request,
  res: Response
) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;

    const {
      processedStorageRef,
      processedBlobName,
      outputFormat,
    } = req.body;

    if (!processedStorageRef || !processedBlobName || !outputFormat) {
      return res.status(400).json({ message: "Missing processed output data" });
    }

    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    if (!resource) {
      return res.status(404).json({ message: "Content output not found" });
    }

    resource.processedStorageRef = processedStorageRef;
    resource.processedBlobName = processedBlobName;
    resource.processedContainerName = "content-processed";
    resource.outputFormat = outputFormat as OutputFormat;

    resource.status = "READY";
    resource.processedAt = new Date().toISOString();

    await Content_outputsContainer
      .item(contentId, userId)
      .replace(resource);

    res.status(200).json(resource);
  } catch (error) {
    console.error("[content_outputs] complete error:", error);
    res.status(500).json({ message: "Failed to save processed output" });
  }
};

/**
 * STEP 4 — Mark processing failed
 */
export const markProcessingFailed = async (
  req: Request,
  res: Response
) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;
    const { errorMessage } = req.body;

    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    if (!resource) {
      return res.status(404).json({ message: "Content output not found" });
    }

    resource.status = "FAILED";
    resource.errorMessage = errorMessage || "Processing failed";

    await Content_outputsContainer
      .item(contentId, userId)
      .replace(resource);

    res.status(200).json(resource);
  } catch (error) {
    console.error("[content_outputs] failed error:", error);
    res.status(500).json({ message: "Failed to mark processing failed" });
  }
};

/**
 * GET — Only READY outputs for dashboard
 */
export const getMyContentOutputs = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const query = {
      query: `
        SELECT * FROM c
        WHERE c.userId = @userId
          AND c.type = "CONTENT_OUTPUT"
          AND c.status = "READY"
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: "@userId", value: userId }],
    };

    const { resources } =
      await Content_outputsContainer.items.query(query).fetchAll();

    res.status(200).json(resources);
  } catch (error) {
    console.error("[content_outputs] fetch error:", error);
    res.status(500).json({ message: "Failed to fetch content outputs" });
  }
};

/**
 * GET — Single content output
 */
export const getContentOutputById = async (
  req: Request,
  res: Response
) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;

    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    if (!resource || resource.status !== "READY") {
      return res.status(404).json({ message: "Content not available" });
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error("[content_outputs] getById error:", error);
    res.status(500).json({ message: "Failed to fetch content output" });
  }
};
