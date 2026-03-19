export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';



export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['counter','admin']);
    await connectDB();

    session.startTransaction();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid order id');
    }

    const order = await Order.findById(id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    /* ❌ SERVED CHECK */
    const servedExists = await OrderItem.exists({
      orderId: id,
      served: true,
      cancelled: false,
    });

    if (servedExists) {
      throw new Error('Cannot cancel. Items already served.');
    }

    /* 🔥 CANCEL ITEMS */
    await OrderItem.updateMany(
      { orderId: id, cancelled: false },
      { cancelled: true, billable: false },
      { session }
    );

    /* 🔥 CLOSE ORDER */
    order.status = 'closed';
    order.closedAt = new Date();
    await order.save({ session });

    /* 🔥 FORCE FREE TABLE (SAFE WAY) */
    if (order.tableId) {
      await Table.updateOne(
        {
          _id: order.tableId,
          currentOrderId: order._id, // ✅ ensure सही order
        },
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
      orderId: id,
      tableFreed: true,
    });

  } catch (err: any) {
    await session.abortTransaction();

    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}