import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const orders = await Order.find(status ? { status } : {})
    .populate('tableId')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    orders.map((o: any) => ({
      _id: o._id,
      status: o.status,
      totalAmount: o.totalAmount ?? 0,
      openedAt: o.openedAt ?? null,
      table: o.tableId,
    })),
  );
}
