export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const reason =
      typeof body?.reason === 'string' && body.reason.trim()
        ? body.reason.trim()
        : 'admin_refund';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (!bill.isPaid) {
      return NextResponse.json(
        { error: 'Only paid bills can be refunded' },
        { status: 400 },
      );
    }

    if (bill.isRefunded) {
      return NextResponse.json(
        { error: 'Bill already refunded' },
        { status: 400 },
      );
    }

    bill.isRefunded = true;
    bill.refundAt = new Date();
    bill.refundReason = reason;
    bill.refundAmount = bill.totalAmount;

    await bill.save();

    return NextResponse.json({
      success: true,
      billId: bill._id,
      isRefunded: true,
      refundAmount: bill.refundAmount || bill.totalAmount,
    });
  } catch (err: any) {
    console.error('Refund Error:', err);

    return NextResponse.json(
      { error: err.message || 'Refund failed' },
      { status: 500 },
    );
  }
}
