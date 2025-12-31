import crypto from "crypto";
import { Request, Response } from "express";
import { Content_outputsContainer } from "../lib/db.config";

export const createContentOutput = async (req: Request, res: Response) => {
  console.log("[Content Outputs Controller] createContentOutput Triggered");
  console.log(req.body);
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

  console.log("[Content Outputs Controller] Added in container");

  res.status(201).json({
    contentId,
    status: "UPLOADED",
  });
};

export const getContentOutputById = async (req: Request, res: Response) => {
  console.log("[Content Outputs Controller] getContentOutputById Triggered");
  const { contentId } = req.params;
  const userId = req.user.id;

  const { resource } =
    await Content_outputsContainer.item(contentId, userId).read();

  if (!resource) {
    return res.status(404).json({ message: "Not found" });
  }

  console.log("[Content Outputs Controller] getContentOutputById Success");

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

export const getMyContentOutputs = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    console.log("[getMyContentOutputs] Triggered");
    console.log("User ID: ", userId);
    
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateThreshold = threeDaysAgo.toISOString();

    console.log("[getMyContentOutputs] Triggered");
    console.log("Date Threshold: ", dateThreshold);

    const querySpec = {
      query: `
        SELECT * FROM c 
        WHERE c.userId = @userId 
        AND c.status = @status 
        AND c.processedAt >= @dateThreshold
        ORDER BY c.processedAt DESC
      `,
      parameters: [
        { name: "@userId", value: userId },
        { name: "@status", value: "READY" },
        { name: "@dateThreshold", value: dateThreshold }
      ]
    };

    const { resources } = await Content_outputsContainer.items.query(querySpec).fetchAll();

    console.log("[getMyContentOutputs] Success");

    res.status(200).json({
      count: resources.length,
      data: resources
    });

  } catch (error) {
    console.error("[getMyContentOutputs] Failed: ", error);
    return res.status(500).json({ message: "Failed to get content outputs" });
  }
};