import { config } from "./config";
import * as schema from "./schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

let db: ReturnType<typeof drizzle>;

try {
  const client = createClient({
    url: config.database.url,
    authToken: config.database.authToken,
  });

  db = drizzle(client, { schema });

  console.log("Database connected successfully");
} catch (error) {
  console.error("Failed to connect to database:", error);
  throw error;
}

export { db };
export type DbClient = typeof db;
