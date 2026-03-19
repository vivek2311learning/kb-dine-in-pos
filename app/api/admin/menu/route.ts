export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;

    const items = await MenuItem.find(query)
      .select('name price category status')
      .sort({ createdAt: -1 })
      .lean(); // ⚡ fast

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
      name: name.trim(),
      description: description?.trim(),
      price: Number(price),
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