import { createDb, type Db } from "@agentledger/db";

declare global {
  var __agentledgerDb: Db | undefined;
}

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!global.__agentledgerDb) {
    global.__agentledgerDb = createDb(url);
  }
  return global.__agentledgerDb;
}

export function isDemoMode() {
  return process.env.AGENTLEDGER_DEMO_MODE === "true";
}
