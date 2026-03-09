import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

/* ================== GET ================== */

export async function GET() {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const orders = await Order.find({
      status: { $ne: 'closed' },
    })
      .populate('tableId')
      .sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const items = await OrderItem.find({
        orderId: order._id,
        cancelled: false,
      });

      result.push({
        _id: order._id,
        status: order.status,
        table: order.tableId,
        items,
        createdAt: order.createdAt, // ✅ use this instead of openedAt
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ================== POST ================== */

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { tableId } = await req.json();

    if (!tableId || !mongoose.Types.ObjectId.isValid(tableId)) {
      return NextResponse.json(
        { error: 'Valid tableId required' },
        { status: 400 },
      );
    }

    // Check existing running order
    const existingOrder = await Order.findOne({
      tableId,
      status: 'running',
    });

    if (existingOrder) {
      return NextResponse.json(existingOrder);
    }

    // Create new order
    const order = await Order.create({
      tableId,
      status: 'running',
    });

    // Update table
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      currentOrderId: order._id,
    });

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
