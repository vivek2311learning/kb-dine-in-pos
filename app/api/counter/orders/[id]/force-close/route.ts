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

    const order = await Order.findById(id).select('_id tableId status').lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'closed') {
      return NextResponse.json(
        { error: 'Order already closed' },
        { status: 400 },
      );
    }

    const readyItemsExist = await OrderItem.exists({
      orderId: id,
      cancelled: false,
      served: false,
      wasted: false,
      kitchenStatus: 'ready',
    });

    await OrderItem.updateMany(
      {
        orderId: id,
        cancelled: false,
        served: false,
        kitchenStatus: { $in: ['draft', 'pending', 'confirmed', 'preparing'] },
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
    );

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
    );

    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status: 'closed',
          closedReason: 'force_closed',
          closedAt: new Date(),
        },
      },
    );

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
      );
    }

    return NextResponse.json({
      success: true,
      type: 'force_closed',
      hasWaste: !!readyItemsExist,
    });
  } catch (err: any) {
    console.error('Force Close Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to force close order' },
      { status: 400 },
    );
  }
}
