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

    /* -------- VALIDATE ID -------- */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* -------- SERVED CHECK -------- */

    const servedExists = await OrderItem.exists({
      orderId: id,
      served: true,
      cancelled: false,
    });

    if (servedExists) {
      return NextResponse.json(
        { error: 'Cannot close order. Items already served.' },
        { status: 400 },
      );
    }

    /* -------- READY ITEMS → WASTE -------- */

    await OrderItem.updateMany(
      {
        orderId: id,
        kitchenStatus: 'ready',
        served: false,
        cancelled: false,
      },
      {
        $set: {
          wasted: true,
          billable: false,
        },
      },
    );

    /* -------- OTHER ITEMS → CANCEL -------- */

    await OrderItem.updateMany(
      {
        orderId: id,
        kitchenStatus: { $ne: 'ready' },
        cancelled: false,
      },
      {
        $set: {
          cancelled: true,
          billable: false,
        },
      },
    );

    /* -------- CLOSE ORDER -------- */

    order.status = 'closed';
    order.closedAt = new Date();
    order.closedReason = 'abandoned';

    await order.save();

    /* -------- FREE TABLE -------- */

    await Table.findByIdAndUpdate(order.tableId, {
      status: 'free',
      currentOrderId: null,
    });

    return NextResponse.json({
      success: true,
      orderId: id,
      tableFreed: true,
    });
  } catch (err) {
    console.error('Force Close Error:', err);

    return NextResponse.json(
      { error: 'Failed to close order' },
      { status: 500 },
    );
  }
}
