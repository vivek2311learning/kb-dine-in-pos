export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';

import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Bill from '@/app/lib/models/bill';
import Payment from '@/app/lib/models/payment';

import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireRole(['admin']);

    await connectDB();

    const { orderId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    /* -------- ORDER -------- */

    const order = await Order.findById(orderId).populate(
      'tableId',
      'tableNumber',
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* -------- ITEMS -------- */

    const items = await OrderItem.find({ orderId });

    /* -------- BILL -------- */

    const bill = await Bill.findOne({ orderId });

    /* -------- PAYMENT -------- */

    let payments: any[] = [];

    if (bill) {
      payments = await Payment.find({
        billId: bill._id,
      });
    }

    return NextResponse.json({
      _id: order._id,

      status: order.status,

      table: order.tableId,

      openedAt: order.createdAt,

      closedAt: order.closedAt || order.updatedAt,

      billNumber: bill?.billNumber || null,

      totalAmount: bill?.totalAmount || 0,

      isPaid: bill?.isPaid || false,

      payments,

      items,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
