export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['admin']);
    await connectDB();

    const items = await MenuItem.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(items);
  } catch (err) {
    console.error('Menu Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { name, description, price, category } = await req.json();

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (err) {
    console.error('Menu Create Error:', err);

    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 },
    );
  }
}
