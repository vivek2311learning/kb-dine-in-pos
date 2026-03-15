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

    const body = await req.json();

    const { tableId } = body;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return NextResponse.json({ error: 'Invalid table id' }, { status: 400 });
    }

    const table = await Table.findById(tableId);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    if (table.currentOrderId) {
      const order = await Order.findById(table.currentOrderId);

      if (order && order.status === 'running') {
        return NextResponse.json(order);
      }
    }

    const order = await Order.create({
      tableId,
      status: 'running',
    });

    table.status = 'occupied';
    table.currentOrderId = order._id;

    await table.save();

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Create Order Error:', err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
