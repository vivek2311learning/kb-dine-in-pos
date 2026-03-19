export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';

import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ billId: string }> },
) {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const { billId } = await params;

  if (!mongoose.Types.ObjectId.isValid(billId)) {
    return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
  }

  const bill = await Bill.findById(billId);

  if (!bill) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  /* ✅ ONLY SERVED ITEMS */
  const items = await OrderItem.find({
    orderId: bill.orderId,
    served: true,
    cancelled: false,
  }).lean();

  return NextResponse.json({ bill, items });
}