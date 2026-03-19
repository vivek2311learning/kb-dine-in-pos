export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  const users = await User.find()
    .select('name email role isActive createdAt')
    .sort({ createdAt: -1 })
    .lean(); // ⚡ faster

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: 'All fields required' },
      { status: 400 }
    );
  }

  const cleanEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: cleanEmail }).lean();

  if (existing) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 400 }
    );
  }

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password, // 🔐 assume model hashing
    role,
    isActive: true,
  });

  return NextResponse.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
}