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
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    session.startTransaction();

    const order = await Order.findById(id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'closed') {
      throw new Error('Order already closed');
    }

    /* ready items = waste */
    const readyItemsExist = await OrderItem.exists({
      orderId: id,
      cancelled: false,
      wasted: false,
      kitchenStatus: 'ready',
    });

    /* non-ready active items = cancelled */
    await OrderItem.updateMany(
      {
        orderId: id,
        cancelled: false,
        served: false,
        kitchenStatus: { $ne: 'ready' },
      },
      {
        $set: {
          cancelled: true,
          billable: false,
          wasted: false,
          cancelledAt: new Date(),
          cancelStage: 'force_close',
        },
      },
      { session },
    );

    /* ready items = wasted */
    await OrderItem.updateMany(
      {
        orderId: id,
        cancelled: false,
        served: false,
        wasted: false,
        kitchenStatus: 'ready',
      },
      {
        $set: {
          wasted: true,
          billable: false,
        },
      },
      { session },
    );

    order.status = 'closed';
    order.closedReason = 'force_closed';
    order.closedAt = new Date();

    await order.save({ session });

    if (order.tableId) {
      await Table.updateOne(
        {
          _id: order.tableId,
          currentOrderId: order._id,
        },
        {
          $set: {
            status: 'free',
            currentOrderId: null,
          },
        },
        { session },
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      type: 'force_closed',
      hasWaste: !!readyItemsExist,
    });
  } catch (err: any) {
    await session.abortTransaction();

    console.error('Force Close Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to force close order' },
      { status: 400 },
    );
  } finally {
    await session.endSession();
  }
}
