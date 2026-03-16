export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);

    await connectDB();

    const { tableId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return NextResponse.json({ error: 'Invalid table id' }, { status: 400 });
    }

    const table = await Table.findById(tableId);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    /* Prevent duplicate running order */

    if (table.currentOrderId) {
      const runningOrder = await Order.findOne({
        _id: table.currentOrderId,
        status: 'running',
      }).lean();

      if (runningOrder) {
        return NextResponse.json(runningOrder);
      }
    }

    /* Create order */

    const order = await Order.create({
      tableId,
      type: 'dine-in',
      status: 'running',
    });

    /* Update table */

    table.status = 'occupied';
    table.currentOrderId = order._id;

    await table.save();

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Create Order Error:', err);

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}
