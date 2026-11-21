// Local MongoDB for development — `npm run db`.
// Starts a real mongod on 127.0.0.1:27017 with data kept in ./.mongo-data,
// so leads survive restarts. Not for production: use MongoDB Atlas there.
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const dbPath = new URL("../.mongo-data", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { ip: "127.0.0.1", port: 27017, dbPath, storageEngine: "wiredTiger" },
});

console.log(`MongoDB is running at ${server.getUri()}  (data: .mongo-data)`);
console.log("Press Ctrl+C to stop.");

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
