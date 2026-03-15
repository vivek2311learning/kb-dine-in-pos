export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;
    const { reason } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
    }

    const bill = await Bill.findById(id);

    if (!bill || !bill.isPaid) {
      return NextResponse.json(
        { error: 'Invalid refund request' },
        { status: 400 },
      );
    }

    if (bill.isRefunded) {
      return NextResponse.json(
        { error: 'Bill already refunded' },
        { status: 400 },
      );
    }

    // mark refunded
    bill.isRefunded = true;
    bill.refundAt = new Date();
    bill.refundReason = reason;
    bill.refundAmount = bill.totalAmount;

    await bill.save();

    // update order
    const order = await Order.findById(bill.orderId);

    if (order) {
      order.status = 'closed';
      await order.save();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Refund Error:', err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
