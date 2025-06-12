export const config = {
  database: {
    url: process.env.DATABASE_URL || "sqlite.db",
  },
} as const;
