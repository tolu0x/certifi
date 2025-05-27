import { config } from "./config";
import * as schema from "./schema";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

let db: ReturnType<typeof drizzle>;

try {
  const sqlite = new Database(config.database.url);
  sqlite.pragma("foreign_keys = ON");

  db = drizzle(sqlite, { schema });

  console.log("Database connected successfully");
} catch (error) {
  console.error("Failed to connect to database:", error);
  throw error;
}

export { db };
export type DbClient = typeof db;
