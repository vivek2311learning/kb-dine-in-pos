import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI missing');
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Mongo connected');
  } catch (err) {
    console.error('❌ DB Error:', err);
    throw err;
  }
}