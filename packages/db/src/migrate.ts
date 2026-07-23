import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/agentledger";

async function main() {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = path.join(__dirname, "..", "drizzle");
  console.log("Migrating", connectionString.replace(/:[^:@]+@/, ":***@"));
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log("Migrations complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
