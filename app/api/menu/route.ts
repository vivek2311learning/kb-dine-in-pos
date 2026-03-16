export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';

let menuCache: any = null;
let cacheTime = 0;

export async function GET(req: Request) {
  const now = Date.now();

  /* CACHE 60 sec */

  if (menuCache && now - cacheTime < 60000) {
    return NextResponse.json(menuCache);
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const query: any = {
    status: 'active',
  };

  if (category) {
    query.category = category;
  }

  const items = await MenuItem.find(query)
    .sort({ category: 1, name: 1 })
    .lean();

  menuCache = items;
  cacheTime = now;

  return NextResponse.json(items);
}
