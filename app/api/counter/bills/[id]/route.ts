export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const { id } = await context.params;

  const bill = await Bill.findById(id);

  if (!bill) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  const items = await OrderItem.find({
    orderId: bill.orderId,
    cancelled: false,
  });

  return NextResponse.json({ bill, items });
}
