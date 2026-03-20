import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI missing');
}

/* 🔥 GLOBAL CACHE (IMPORTANT) */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10, // ⚡ control connections
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Mongo connected');
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('❌ DB Error:', err);
    throw err;
  }
}
