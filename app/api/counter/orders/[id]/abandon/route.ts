export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Bill from '@/app/lib/models/bill';
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

    /* VALIDATE ID */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'running') {
      return NextResponse.json(
        { error: 'Only running orders can be abandoned' },
        { status: 400 },
      );
    }

    /* BILL CHECK */

    const billExists = await Bill.exists({ orderId: id });

    if (billExists) {
      return NextResponse.json(
        { error: 'Cannot abandon after bill generated' },
        { status: 400 },
      );
    }

    /* CONFIRMED ITEMS CHECK */

    const confirmedExists = await OrderItem.exists({
      orderId: id,
      kitchenStatus: { $ne: 'draft' },
      cancelled: false,
    });

    if (confirmedExists) {
      return NextResponse.json(
        { error: 'Cannot abandon. Items already confirmed.' },
        { status: 400 },
      );
    }

    /* DELETE ONLY DRAFT ITEMS */

    await OrderItem.deleteMany({
      orderId: id,
      kitchenStatus: 'draft',
    });

    /* CLOSE ORDER */

    order.status = 'closed';
    order.closedAt = new Date();
    order.closedReason = 'abandoned';

    await order.save();

    /* FREE TABLE */

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
    console.error('Abandon Order Error:', err);

    return NextResponse.json(
      { error: 'Failed to abandon order' },
      { status: 500 },
    );
  }
}
