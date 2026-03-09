import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const query: any = {
    status: 'active', // ✅ lifecycle based
  };

  if (category) {
    query.category = category;
  }

  const items = await MenuItem.find(query).sort({ category: 1, name: 1 });

  return NextResponse.json(items);
}
