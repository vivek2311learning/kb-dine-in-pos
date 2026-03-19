export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import RefundLog from '@/app/lib/models/refundlog';

import { cookies } from 'next/headers';
import { verifyToken } from '@/app/lib/auth/token';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['admin']); // 🔥 refund only admin
    await connectDB();

    session.startTransaction();

    const { billId } = await params;
    const { amount, reason } = await req.json();

    /* 🔐 USER */
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) throw new Error('Not authenticated');

    const payload: any = await verifyToken(token);

    /* 🔍 BILL */
    const bill = await Bill.findById(billId).session(session);

    if (!bill) throw new Error('Bill not found');

    if (!bill.isPaid) {
      throw new Error('Cannot refund unpaid bill');
    }

    /* 🔥 VALIDATION */

    if (!amount || amount <= 0) {
      throw new Error('Invalid refund amount');
    }

    if (amount > bill.totalAmount) {
      throw new Error('Refund exceeds total amount');
    }

    /* 🔥 PARTIAL REFUND SUPPORT */

    const totalRefunded = bill.refundAmount || 0;

    if (totalRefunded + amount > bill.totalAmount) {
      throw new Error('Refund exceeds remaining amount');
    }

    /* 🔥 UPDATE BILL */

    bill.refundAmount = totalRefunded + amount;

    if (bill.refundAmount === bill.totalAmount) {
      bill.isRefunded = true; // full refund
    }

    await bill.save({ session });

    /* 🔥 LOG */

    await RefundLog.create(
      [
        {
          billId,
          amount,
          reason,
          refundedBy: payload.userId, // 🔥 track user
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      refunded: amount,
      totalRefunded: bill.refundAmount,
    });

  } catch (err: any) {
    await session.abortTransaction();
    console.error('Refund Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}