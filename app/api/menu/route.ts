export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';

let menuCache: any = null;
let cacheTime = 0;

export async function GET() {
  const now = Date.now();

  /* ✅ 5 min cache (better) */
  if (menuCache && now - cacheTime < 300000) {
    return NextResponse.json(menuCache);
  }

  await connectDB();

  /* ✅ only active items */
  const items = await MenuItem.find({ status: 'active' })
    .select('name price category') // ⚡ reduce payload
    .sort({ category: 1, name: 1 })
    .lean();

  menuCache = items;
  cacheTime = now;

  return NextResponse.json(items);
}