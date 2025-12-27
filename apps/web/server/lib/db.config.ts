import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";

export const connectDB = async () => {
  const endpoint = process.env.COSMOSDB_ENDPOINT ;
  const databaseName = process.env.COSMOSDB_NAME ;
  const cosmosKey = process.env.COSMOSDB_CONNECTION_STRING_RW ;

  if (!endpoint || !databaseName) {
    console.error("Missing Cosmos DB configuration!");
    console.error("Please set COSMOSDB_ENDPOINT and COSMOSDB_NAME in your .env file");
    return;
  }

  try {
    let cosmosClient;

    console.log("Using key-based authentication");
    cosmosClient = new CosmosClient({
    endpoint,
    key: cosmosKey,
    });
    
    const database = cosmosClient.database(databaseName);
    await database.read();
    
    console.log("Connected to Cosmos DB successfully!");
    console.log(`Database: ${databaseName}`);
  } catch (error) {
    console.error("Cosmos DB connection failed:", error instanceof Error ? error.message : error);
  }
};

