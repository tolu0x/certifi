import { db } from "../lib/db";
import { migrate } from "drizzle-orm/libsql/migrator";

migrate(db, { migrationsFolder: "drizzle" });

console.log("Migrations completed successfully!");
