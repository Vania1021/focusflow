import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.COSMOSDB_ENDPOINT;
const databaseName = process.env.COSMOSDB_NAME;
const cosmosKey = process.env.COSMOSDB_CONNECTION_STRING_RW;

if (!endpoint || !databaseName || !cosmosKey) {
  console.error("Missing Cosmos DB configuration!");
  console.error("Please set COSMOSDB_ENDPOINT, COSMOSDB_NAME, and COSMOSDB_CONNECTION_STRING_RW in your .env file");
}

export const client = new CosmosClient({
  endpoint: endpoint || "",
  key: cosmosKey || "",
});

export const connectDB = async () => {
  try {
    const database = client.database(databaseName!);
    await database.read();
    console.log("Connected to Cosmos DB successfully!");
    console.log(`Database: ${databaseName}`);
  } catch (error) {
    console.error("Cosmos DB connection failed:", error instanceof Error ? error.message : error);
    process.exit(1); 
  }
};

export const UserContainer = client.database(databaseName!).container("users");
export const PreferencesContainer = client.database(databaseName!).container("preferences");
