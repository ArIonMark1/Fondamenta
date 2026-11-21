import "server-only";
import { MongoClient, type Db } from "mongodb";

// Reuse one client across hot reloads in dev and across requests in prod.
const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<MongoClient> };

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env");

  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
      .connect()
      .catch((err) => {
        globalForMongo._mongoClient = undefined; // allow a retry on the next request
        throw err;
      });
  }
  return globalForMongo._mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || "fondamenta");
}
