export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuCategory from '@/app/lib/models/menuCategory';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['admin']);
    await connectDB();

    const categories = await MenuCategory.find({})
      .select('_id name isActive createdAt')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (err) {
    console.error('Menu Categories Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 },
      );
    }

    const existing = await MenuCategory.findOne({
      name: {
        $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 },
      );
    }

    const category = await MenuCategory.create({
      name,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (err) {
    console.error('Menu Category Create Error:', err);

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    );
  }
}
