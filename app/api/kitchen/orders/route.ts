export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['kitchen', 'counter', 'admin']);
    await connectDB();

    const items = await OrderItem.find();

    const result = [];

    for (const item of items) {
      const table = await Table.findById(item.tableId);

      result.push({
        ...item.toObject(),
        tableId: table,
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Kitchen Orders Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
