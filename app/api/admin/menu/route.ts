export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import MenuCategory from '@/app/lib/models/menuCategory';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const query: Record<string, any> = {};

    if (category) {
      query.category = category.trim();
    }

    if (status) {
      query.status = status.trim();
    }

    const items = await MenuItem.find(query)
      .select('_id name description price category status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

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

    const body = await req.json();

    const name = String(body?.name || '').trim();
    const description = String(body?.description || '').trim();
    const category = String(body?.category || '').trim();
    const price = Number(body?.price);

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description and category are required' },
        { status: 400 },
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 },
      );
    }

    const categoryDoc = await MenuCategory.findOne({
      name: category,
      isActive: true,
    }).lean();

    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'Selected category is invalid or disabled' },
        { status: 400 },
      );
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      status: 'active',
    });

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Menu Create Error:', err);

    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 },
    );
  }
}
