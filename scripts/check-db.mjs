import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set (check .env)"); process.exit(1); }
// Check that MONGODB_URI connects — `npm run db:check`. Password is never printed.
const host = uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@/, "").split(/[/?]/)[0];
const t0 = Date.now();
try {
  const client = await MongoClient.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = client.db(process.env.MONGODB_DB || "fondamenta");
  const ping = await db.command({ ping: 1 });
  const hello = await db.admin().command({ hello: 1 });
  const count = await db.collection("leads").countDocuments();
  console.log(JSON.stringify({ host, ping: ping.ok, ms: Date.now() - t0, replicaSet: hello.setName, isWritablePrimary: hello.isWritablePrimary, db: db.databaseName, leadsCount: count }));
  await client.close();
} catch (e) {
  console.log(JSON.stringify({ host, error: e.name, message: String(e.message).replace(/\/\/[^@]*@/g, "//***@").slice(0, 300) }));
  process.exit(1);
}
