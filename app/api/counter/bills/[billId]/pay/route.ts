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

    const { billId } = await params;
    const { payments } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      throw new Error('Invalid bill id');
    }

    if (!Array.isArray(payments) || payments.length === 0) {
      throw new Error('Payments are required');
    }

    session.startTransaction();

    const bill = await Bill.findById(billId).session(session);

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.isPaid) {
      throw new Error('Bill already paid');
    }

    const totalPaid = payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0,
    );

    if (totalPaid !== bill.totalAmount) {
      throw new Error('Payment mismatch');
    }

    const token = (await cookies()).get('auth_token')?.value;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const payload: any = await verifyToken(token);

    const paymentDocs = payments.map((p: any) => ({
      billId: bill._id,
      method: p.method,
      amount: Number(p.amount),
      receivedBy: payload.userId,
    }));

    for (const payment of paymentDocs) {
      await Payment.create([payment], { session });
    }

    bill.isPaid = true;
    bill.paidAt = new Date();
    bill.paidAmount = totalPaid;
    await bill.save({ session });

    const order = await Order.findById(bill.orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'closed') {
      throw new Error('Order already closed');
    }

    order.status = 'closed';
    order.closedReason = 'completed';
    order.closedAt = new Date();
    await order.save({ session });

    if (order.tableId) {
      await Table.updateOne(
        {
          _id: order.tableId,
          currentOrderId: order._id,
        },
        {
          status: 'free',
          currentOrderId: null,
        },
        { session },
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      billId: bill._id,
      orderId: order._id,
      status: 'closed',
      closedReason: 'completed',
    });
  } catch (err: any) {
    await session.abortTransaction();
    console.error('Payment Error:', err);

    return NextResponse.json(
      { error: err.message || 'Payment failed' },
      { status: 500 },
    );
  } finally {
    await session.endSession();
  }
}
