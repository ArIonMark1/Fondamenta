import { MongoMemoryServer } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

// One throwaway in-memory MongoDB for the whole run; every test file gets its own database.
export default async function setup(project: TestProject) {
  const server = await MongoMemoryServer.create();
  project.provide("mongoUri", server.getUri());
  return async () => {
    await server.stop();
  };
}
