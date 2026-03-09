import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  const items = await MenuItem.find().sort({ createdAt: -1 });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await connectDB();

  const { name, description, price, category } = await req.json();

  const item = await MenuItem.create({
    name,
    description,
    price,
    category,
    status: 'draft', // ✅ force draft
  });

  return NextResponse.json(item);
}
