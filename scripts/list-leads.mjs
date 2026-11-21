// Print the latest requests from the contact form — `npm run leads`.
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (check .env)");
  process.exit(1);
}

const client = await MongoClient.connect(uri, { serverSelectionTimeoutMS: 5000 });
const leads = await client
  .db(process.env.MONGODB_DB || "fondamenta")
  .collection("leads")
  .find({}, { projection: { userAgent: 0 } })
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();

console.log(leads.length ? leads : "No leads yet.");
await client.close();
