export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';

import BillingConfig from '@/app/lib/models/billingConfig';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';

import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    session.startTransaction();

    const { orderId, discount = 0 } = await req.json();

    if (!orderId) throw new Error('OrderId required');

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');

    /* 🔥 DUPLICATE CHECK */
    const existing = await Bill.findOne({ orderId }).session(session);
    if (existing) {
      await session.abortTransaction();
      return NextResponse.json(existing);
    }

    /* ✅ STATUS */
    if (!['running', 'billed'].includes(order.status)) {
      throw new Error('Order not eligible for billing');
    }

    /* ✅ ONLY SERVED ITEMS */
    const items = await OrderItem.find({
      orderId,
      served: true,
      cancelled: false,
    }).session(session);

    if (!items.length) throw new Error('No served items');

    const subtotal = items.reduce(
      (sum, i) => sum + i.priceSnapshot * i.quantity,
      0,
    );

    /* ✅ GST */
    const config = await BillingConfig.findOne().lean();
    const gstPercent = config?.gstPercent ?? 0;

    const taxAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + taxAmount - discount;

    /* 🔥 SAFE BILL NUMBER */
    const last = await Bill.findOne({}, { billNumber: 1 })
      .sort({ billNumber: -1 })
      .lean()
      .session(session);

    const nextBillNumber = last ? last.billNumber + 1 : 1;

    const bill = await Bill.create(
      [
        {
          billNumber: nextBillNumber,
          orderId,
          subtotal,
          tax: taxAmount,
          discount,
          totalAmount,
        },
      ],
      { session },
    );

    /* 🔥 CANCEL REMAINING */
    await OrderItem.updateMany(
      {
        orderId,
        served: false,
        cancelled: false,
      },
      {
        cancelled: true,
        billable: false,
      },
      { session },
    );

    /* 🔥 UPDATE ORDER */
    order.status = 'billed';
    await order.save({ session });

    await session.commitTransaction();

    return NextResponse.json(bill[0]);

  } catch (err: any) {
    await session.abortTransaction();
    console.error('Billing Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}