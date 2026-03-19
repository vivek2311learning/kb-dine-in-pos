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
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    /* 🔥 MINIMAL FETCH */
    const order = await Order.findById(id)
      .select('tableId')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* 🔥 SERVED CHECK (FAST) */
    const servedExists = await OrderItem.exists({
      orderId: id,
      served: true,
      cancelled: false,
    });

    if (servedExists) {
      return NextResponse.json(
        { error: 'Cannot close. Items already served.' },
        { status: 400 },
      );
    }

    /* 🔥 SINGLE BULK UPDATE */
    await OrderItem.updateMany(
      { orderId: id, cancelled: false },
      [
        {
          $set: {
            cancelled: {
              $cond: [{ $ne: ['$kitchenStatus', 'ready'] }, true, '$cancelled'],
            },
            wasted: {
              $cond: [{ $eq: ['$kitchenStatus', 'ready'] }, true, '$wasted'],
            },
            billable: false,
          },
        },
      ],
    );

    /* 🔥 CLOSE ORDER */
    await Order.updateOne(
      { _id: id },
      {
        status: 'closed',
        closedAt: new Date(),
        closedReason: 'force_closed',
      },
    );

    /* 🔥 FREE TABLE */
    if (order.tableId) {
      await Table.updateOne(
        { _id: order.tableId },
        { status: 'free', currentOrderId: null },
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Force Close Error:', err);

    return NextResponse.json(
      { error: 'Failed to force close order' },
      { status: 500 },
    );
  }
}