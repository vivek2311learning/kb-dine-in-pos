export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import Payment from '@/app/lib/models/payment';
import Table from '@/app/lib/models/Table';

import { cookies } from 'next/headers';
import { verifyToken } from '@/app/lib/auth/token';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ billId: string }> },
) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    session.startTransaction();

    const { billId } = await params;
    const { payments } = await req.json();

    const bill = await Bill.findById(billId).session(session);
    if (!bill) throw new Error('Bill not found');

    if (bill.isPaid) throw new Error('Already paid');

    const totalPaid = payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );

    if (totalPaid !== bill.totalAmount) {
      throw new Error('Payment mismatch');
    }

    const token = (await cookies()).get('auth_token')?.value;
    if (!token) throw new Error('Not authenticated');

    const payload: any = await verifyToken(token);

    /* 🔥 SAVE PAYMENTS */
    await Payment.insertMany(
      payments.map((p: any) => ({
        billId: bill._id,
        method: p.method,
        amount: p.amount,
        receivedBy: payload.userId,
      })),
      { session }
    );

    /* 🔥 UPDATE BILL */
    bill.isPaid = true;
    bill.paidAt = new Date();
    await bill.save({ session });

    /* 🔥 UPDATE ORDER */
    const order = await Order.findById(bill.orderId).session(session);
    if (!order) throw new Error('Order not found');

    order.status = 'paid';
    order.closedAt = new Date();
    await order.save({ session });

    /* 🔥 FREE TABLE */
    if (order.tableId) {
      await Table.findByIdAndUpdate(
        order.tableId,
        {
          status: 'free',
          currentOrderId: null,
        },
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      orderId: order._id,
    });

  } catch (err: any) {
    await session.abortTransaction();
    console.error('Payment Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}