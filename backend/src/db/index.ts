import mongoose from "mongoose";
import type { ConnectOptions, Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!globalThis.mongoose) {
  globalThis.mongoose = { conn: null, promise: null } as {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

export async function connectDatabase(): Promise<Connection | null> {
  if (globalThis.mongoose.conn) {
    return globalThis.mongoose.conn;
  }

  if (!MONGODB_URI) {
    // Do not throw at module import time. Throwing prevents the app from
    // starting in environments where env vars are injected later (e.g. CI/
    // container platforms). Instead, return null and let callers decide how
    // to proceed.
    console.warn('MONGODB_URI not provided; skipping DB connection')
    return null
  }

  if (!globalThis.mongoose.promise) {
    const options: ConnectOptions = {
      bufferCommands: true,
      maxPoolSize: 10,
    } as ConnectOptions;

    globalThis.mongoose.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    globalThis.mongoose.conn = await globalThis.mongoose.promise;
  } catch (error) {
    globalThis.mongoose.promise = null;
    throw error;
  }

  return globalThis.mongoose.conn;
}

export async function disconnectDatabase(): Promise<void> {
  if (globalThis.mongoose.conn) {
    await mongoose.disconnect();
    globalThis.mongoose.conn = null;
    globalThis.mongoose.promise = null;
  }
}
