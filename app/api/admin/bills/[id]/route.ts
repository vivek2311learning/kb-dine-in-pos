export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import Payment from '@/app/lib/models/payment';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
    }

    const bill = await Bill.findById(id)
      .select(
        'orderId billNumber totalAmount subtotal tax discount isPaid paidAt isRefunded refundAt refundReason printedAt createdAt',
      )
      .lean();

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const [items, payments] = await Promise.all([
      OrderItem.find({
        orderId: bill.orderId,
        cancelled: false,
        wasted: false,
      })
        .select('nameSnapshot priceSnapshot quantity served')
        .lean(),

      Payment.find({ billId: id }).select('method amount').lean(),
    ]);

    return NextResponse.json({
      _id: bill._id,
      orderId: bill.orderId,
      billNumber: bill.billNumber,
      subtotal: bill.subtotal || 0,
      tax: bill.tax || 0,
      discount: bill.discount || 0,
      totalAmount: bill.totalAmount || 0,
      isPaid: !!bill.isPaid,
      paidAt: bill.paidAt || null,
      isRefunded: !!bill.isRefunded,
      refundAt: bill.refundAt || null,
      refundReason: bill.refundReason || null,
      printedAt: bill.printedAt || bill.createdAt || null,
      items,
      payments,
    });
  } catch (err: any) {
    console.error('Bill Detail Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to load bill detail' },
      { status: 500 },
    );
  }
}
