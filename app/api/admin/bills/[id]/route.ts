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

    /* ✅ VALIDATION */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bill id' },
        { status: 400 }
      );
    }

    /* ⚡ LIGHT BILL FETCH */
    const bill = await Bill.findById(id)
      .select(
        'billNumber totalAmount subtotal tax discount isPaid paidAt isRefunded refundAt refundReason orderId printedAt'
      )
      .lean();

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    /* ⚡ PARALLEL FETCH */
    const [items, payments] = await Promise.all([
      OrderItem.find({
        orderId: bill.orderId,
        cancelled: false,
      })
        .select('nameSnapshot priceSnapshot quantity served')
        .lean(),

      Payment.find({ billId: id })
        .select('method amount')
        .lean(),
    ]);

    /* ✅ RESPONSE */
    return NextResponse.json({
      ...bill,
      items,
      payments,
    });

  } catch (err: any) {
    console.error('Bill Detail Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}