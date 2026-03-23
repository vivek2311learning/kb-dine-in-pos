export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';

export async function GET() {
  try {
    await connectDB();

    const items = await MenuItem.find({ status: 'active' })
      .select('_id name description price category')
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Public Menu Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 },
    );
  }
}
