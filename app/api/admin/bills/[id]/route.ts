import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { requireRole } from '@/app/lib/auth/requireRole';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import Payment from '@/app/lib/models/payment';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['admin']);
  await connectDB();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
  }

  const bill = await Bill.findById(id)
    .populate({
      path: 'orderId',
      populate: { path: 'tableId' },
    })
    .lean();

  if (!bill) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  const items = await OrderItem.find({
    orderId: bill.orderId._id,
  }).lean();

  const payments = await Payment.find({
    billId: bill._id,
  }).lean();

  return NextResponse.json({
    bill,
    items,
    payments,
  });
}
