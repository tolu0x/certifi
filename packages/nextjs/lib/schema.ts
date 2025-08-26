import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/mysql-core";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  studentId: text("student_id").unique(),
  walletAddress: text("wallet_address").unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const studentCertificate = sqliteTable("student_cert", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  fieldOfStudy: text("field_of_study").notNull(),
  issueDate: text("issue_date").notNull(),
  documentHash: text("document_hash"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
