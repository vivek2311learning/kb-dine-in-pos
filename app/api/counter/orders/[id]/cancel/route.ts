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

    const order = await Order.findById(id)
      .select('_id type tableId status')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'closed') {
      return NextResponse.json(
        { error: 'Order already closed' },
        { status: 400 },
      );
    }

    const items = await OrderItem.find(
      {
        orderId: id,
        cancelled: false,
      },
      'served wasted kitchenStatus',
    ).lean();

    const hasKitchenProgress = items.some(
      (item: any) =>
        !item.wasted &&
        (item.served === true ||
          ['pending', 'confirmed', 'preparing', 'ready'].includes(
            item.kitchenStatus,
          )),
    );

    if (!hasKitchenProgress) {
      await OrderItem.updateMany(
        { orderId: id, cancelled: false },
        {
          $set: {
            cancelled: true,
            billable: false,
            wasted: false,
            cancelledAt: new Date(),
            cancelStage: 'cancelled',
          },
        },
      );

      await Order.updateOne(
        { _id: id },
        {
          $set: {
            status: 'closed',
            closedReason: 'cancelled',
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
        orderId: id,
        type: 'cancelled',
      });
    }

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
      orderId: id,
      type: 'force_closed',
    });
  } catch (err: any) {
    console.error('Cancel Order Error:', err);

    return NextResponse.json(
      { error: err.message || 'Cancel failed' },
      { status: 400 },
    );
  }
}
