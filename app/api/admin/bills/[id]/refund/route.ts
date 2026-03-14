import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import RefundLog from '@/app/lib/models/refundlog';

import mongoose from 'mongoose';

import { requireRole } from '@/app/lib/auth/requireRole';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {

  try {

    /* ---------------- AUTH ---------------- */

    await requireRole(['admin']);

    const cookieStore = await cookies();

    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId as string;

    /* ---------------- DB ---------------- */

    await connectDB();

    const { id } = await context.params;

    const { reason } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid bill id' },
        { status: 400 }
      );
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    if (!bill.isPaid) {
      return NextResponse.json(
        { error: 'Cannot refund unpaid bill' },
        { status: 400 }
      );
    }

    if (bill.isRefunded) {
      return NextResponse.json(
        { error: 'Bill already refunded' },
        { status: 400 }
      );
    }

    /* ---------------- REFUND ---------------- */

    bill.isRefunded = true;

    bill.refundAt = new Date();

    bill.refundReason = reason;

    bill.refundAmount = bill.totalAmount;

    bill.refundedBy = new mongoose.Types.ObjectId(userId);

    await bill.save();

    /* ---------------- ORDER CLOSE ---------------- */

    const order = await Order.findById(bill.orderId);

    if (order) {

      order.status = 'closed';

      await order.save();

    }

    /* ---------------- REFUND LOG ---------------- */

    await RefundLog.create({

      billId: bill._id,

      orderId: bill.orderId,

      amount: bill.totalAmount,

      reason,

      refundedBy: new mongoose.Types.ObjectId(userId),

    });

    return NextResponse.json({
      success: true,
      message: 'Refund completed'
    });

  } catch (err: any) {

    console.error('Refund Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}