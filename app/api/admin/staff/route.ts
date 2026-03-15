export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { requireRole } from '@/app/lib/auth/requireRole';

/* ================== GET ================== */

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  const users = await User.find().select('-password').sort({ createdAt: -1 });

  return NextResponse.json(users);
}

/* ================== POST ================== */

export async function POST(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const existing = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 400 },
    );
  }

  // ❌ NO bcrypt here
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password, // 👈 plain password
    role,
    isActive: true,
  });

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return NextResponse.json(safeUser);
}
