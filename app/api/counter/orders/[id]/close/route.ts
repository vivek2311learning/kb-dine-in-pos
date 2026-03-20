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

    if (order.status !== 'paid') {
      throw new Error('Order must be paid before closing');
    }

    order.status = 'closed';
    order.closedReason = 'completed';
    order.closedAt = new Date();

    await order.save({ session });

    if (order.tableId) {
      await Table.updateOne(
        {
          _id: order.tableId,
          currentOrderId: order._id,
        },
        {
          status: 'free',
          currentOrderId: null,
        },
        { session },
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      type: 'completed',
    });
  } catch (err: any) {
    await session.abortTransaction();

    console.error('Complete Order Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to close order' },
      { status: 400 },
    );
  } finally {
    await session.endSession();
  }
}
