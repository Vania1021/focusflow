import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.BLOBDB_CONNECTION_STRING!
);

export const downloadBlobAsBuffer = async (
  blobUrl: string
): Promise<Buffer> => {
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
