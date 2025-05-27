export const config = {
  database: {
    url: process.env.DATABASE_URL || "sqlite.db",
    // Add any other database configuration options here
  },
  // Add other configuration items as needed
} as const;
