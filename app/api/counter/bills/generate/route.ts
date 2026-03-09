import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/lib/models/order';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['counter', 'admin']);
    await connectDB();
    session.startTransaction();

    const { orderId, tax = 0, discount = 0 } = await req.json();

    if (!orderId) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'OrderId required' }, { status: 400 });
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'paid' || order.status === 'closed') {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Order already paid or closed' },
        { status: 400 },
      );
    }

    // ✅ DUPLICATE BILL PROTECTION
    const existingBill = await Bill.findOne({ orderId }).session(session);

    if (existingBill) {
      await session.abortTransaction();
      return NextResponse.json(existingBill);
    }

    // ✅ Only SERVED items included
    const servedItems = await OrderItem.find({
      orderId,
      served: true,
      cancelled: false,
    }).session(session);

    if (servedItems.length === 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'No served items available for billing' },
        { status: 400 },
      );
    }

    const subtotal = servedItems.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    const totalAmount = subtotal + tax - discount;

    // ✅ Safe Bill Number
    const lastBill = await Bill.findOne()
      .sort({ billNumber: -1 })
      .session(session);

    const nextBillNumber = lastBill?.billNumber ? lastBill.billNumber + 1 : 1;

    const bill = await Bill.create(
      [
        {
          billNumber: nextBillNumber,
          orderId,
          subtotal,
          tax,
          discount,
          totalAmount,
        },
      ],
      { session },
    );

    // ✅ Auto Cancel Remaining Items
    await OrderItem.updateMany(
      {
        orderId,
        served: false,
        cancelled: false,
      },
      {
        cancelled: true,
        billable: false,
        cancelReason: 'Auto cancelled at billing',
      },
      { session },
    );

    // ✅ Mark order as billed
    order.status = 'billed';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(bill[0]);
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('Bill Generate Error:', err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
