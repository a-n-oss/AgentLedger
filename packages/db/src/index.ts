import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import * as relations from "./relations.js";

export function createDb(connectionString: string) {
  const client = postgres(connectionString, { prepare: false, max: 10 });
  return drizzle(client, { schema: { ...schema, ...relations } });
}

export type Db = ReturnType<typeof createDb>;

export * from "./schema.js";
export * from "./relations.js";
