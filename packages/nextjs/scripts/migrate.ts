import { db } from "../lib/db";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

migrate(db, { migrationsFolder: "drizzle" });

console.log("Migrations completed successfully!");
