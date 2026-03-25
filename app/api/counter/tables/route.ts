export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const tables = await Table.find()
      .select('_id tableNumber status currentOrderId')
      .sort({ tableNumber: 1 })
      .lean();

    return NextResponse.json(tables);
  } catch (err) {
    console.error('Tables Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 },
    );
  }
}
