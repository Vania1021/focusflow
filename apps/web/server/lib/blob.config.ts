/// <reference types="multer" />
import { BlobServiceClient } from "@azure/storage-blob";
import { InputType } from "../models/content_outputs";

import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.BLOBDB_CONNECTION_STRING;

if (!connectionString) {
  console.error("Missing Blob Storage connection string!");
}

export const blobServiceClient = connectionString 
  ? BlobServiceClient.fromConnectionString(connectionString) 
  : null as unknown as BlobServiceClient;

export const checkBlobConnection = async () => {
  if (!blobServiceClient) {
    console.error("Blob storage client not initialized. Check your .env file.");
    process.exit(1);
  }
  try {
    await blobServiceClient.getAccountInfo();
    console.log("Connection to Blob Storage successful");
  } catch (error) {
    console.error("Failed to connect to Blob Storage:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

const containerMap: Record<InputType, any> = {
  video: blobServiceClient?.getContainerClient("content-video"),
  audio: blobServiceClient?.getContainerClient("content-audio"),
  text: blobServiceClient?.getContainerClient("content-text"),
};

export const getContainerClient = (type: InputType) => {
  return containerMap[type];
};

export const uploadToBlob = async (file: Express.Multer.File, type: InputType) => {
  const containerClient = getContainerClient(type);
  if (!containerClient) throw new Error(`Invalid container type: ${type}`);

  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName); //An object that represents one blob inside this container, so we can upload, download, or manage it

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return {storageRef:blockBlobClient.url,blobName:blockBlobClient.name};
};

export const ContentVideoContainerBlob = containerMap.video;
export const ContentAudioContainerBlob = containerMap.audio;
export const ContentTextContainerBlob = containerMap.text;
