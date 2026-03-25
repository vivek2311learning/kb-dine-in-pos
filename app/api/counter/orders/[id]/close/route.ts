export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
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

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid before closing' },
        { status: 400 },
      );
    }

    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status: 'closed',
          closedReason: 'completed',
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
      type: 'completed',
    });
  } catch (err: any) {
    console.error('Complete Order Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to close order' },
      { status: 400 },
    );
  }
}
