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

    /* 🔥 SINGLE QUERY (TABLE + ORDER CHECK) */
    const table = await Table.findById(tableId)
      .select('currentOrderId status')
      .lean();

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    /* ✅ CHECK EXISTING */
    if (table.currentOrderId) {
      const existing = await Order.findOne({
        _id: table.currentOrderId,
        status: 'running',
      })
        .select('_id tableId type status')
        .lean();

      if (existing) {
        return NextResponse.json(existing);
      }
    }

    /* ✅ CREATE ORDER */
    const order = await Order.create({
      tableId,
      type: 'dine-in',
      status: 'running',
    });

    /* 🔥 FAST UPDATE (NO FETCH AGAIN) */
    await Table.updateOne(
      { _id: tableId },
      {
        status: 'occupied',
        currentOrderId: order._id,
      },
    );

    return NextResponse.json(order);

  } catch (err: any) {
    console.error('Create Order Error:', err);

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}