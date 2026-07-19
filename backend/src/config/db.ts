import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return { connected: false, reason: "MONGODB_URI not configured" };
  }

  if (mongoose.connection.readyState === 1) {
    return { connected: true, reason: "already connected" };
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "vidyasetu_ai",
    });
  }

  await connectionPromise;
  return { connected: true, reason: "connected" };
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
