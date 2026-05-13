/**
 * Vercel Serverless Function — wraps the Express app as a handler.
 *
 * DATA_DIR must be set BEFORE any module that opens the SQLite DB is imported,
 * because better-sqlite3 opens the file synchronously at import time.
 */
if (!process.env.DATA_DIR) {
  process.env.DATA_DIR = "/tmp/galaxymart-data";
}

// The API server is pre-built to dist/app.mjs by the Vercel buildCommand.
const { default: app } = await import(
  "../artifacts/api-server/dist/app.mjs"
);

export default app;
