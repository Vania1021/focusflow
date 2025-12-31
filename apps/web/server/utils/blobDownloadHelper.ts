import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { BlobServiceClient } from "@azure/storage-blob";

const streamPipeline = promisify(pipeline);

console.log(`[Blob Download Helper] Initialization - Connection String: ${process.env.BLOBDB_CONNECTION_STRING ? "LOADED" : "MISSING"}`);
const connectionString = process.env.BLOBDB_CONNECTION_STRING;
console.log(`[Blob Download Helper] Initialization - Connection String: ${connectionString ? "LOADED" : "MISSING"}`);

const blobServiceClient = connectionString 
  ? BlobServiceClient.fromConnectionString(connectionString)
  : null;

export const downloadBlobAsBuffer = async (
  blobUrl: string
): Promise<Buffer> => {
  if (!blobServiceClient) {
    throw new Error("BlobServiceClient not initialized. Check BLOBDB_CONNECTION_STRING.");
  }
  const url = new URL(blobUrl);

  const containerName = url.pathname.split("/")[1];

  // 🔥 CRITICAL FIX: decode blob name ONCE
  const blobName = decodeURIComponent(
    url.pathname.split("/").slice(2).join("/")
  );

  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  const blobClient = containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();

  const chunks: Buffer[] = [];
  for await (const chunk of downloadResponse.readableStreamBody!) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks);
};

export const downloadBlobToFilePath = async (
  blobUrl: string, 
  destinationPath: string
): Promise<void> => {
  if (!blobServiceClient) {
    throw new Error("BlobServiceClient not initialized.");
  }

  // Reusing specific URL parsing logic
  const url = new URL(blobUrl);
  const containerName = url.pathname.split("/")[1];
  const blobName = decodeURIComponent(
    url.pathname.split("/").slice(2).join("/")
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();

  if (!downloadResponse.readableStreamBody) {
    throw new Error("Blob stream is empty");
  }

  // Stream directly to the file system (prevents memory crash on large videos)
  const fileWriter = fs.createWriteStream(destinationPath);
  await streamPipeline(downloadResponse.readableStreamBody, fileWriter);
};

//  Upload String to Blob (REQUIRED FOR SAVING SUMMARY) ---
export const uploadToBlob = async (
  blobName: string, 
  content: string, 
  containerName = "content-outputs"
): Promise<string> => {
  if (!blobServiceClient) {
    throw new Error("BlobServiceClient not initialized.");
  }

  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Ensure container exists
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  // Upload the text content
  await blockBlobClient.upload(content, Buffer.byteLength(content));
  
  return blockBlobClient.url;
};
