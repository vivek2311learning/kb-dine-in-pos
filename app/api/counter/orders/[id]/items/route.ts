export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Order from '@/app/lib/models/order';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { orderId, name, price, quantity = 1 } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    /* 🔥 FETCH MINIMAL */
    const order = await Order.findById(orderId)
      .select('_id tableId')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* 🔥 ATOMIC MERGE */
    const updated = await OrderItem.findOneAndUpdate(
      {
        orderId,
        nameSnapshot: name,
        kitchenStatus: 'draft',
        cancelled: false,
      },
      {
        $inc: { quantity },
      },
      { new: true }
    ).lean();

    if (updated) return NextResponse.json(updated);

    /* CREATE NEW */
    const newItem = await OrderItem.create({
      orderId,
      tableId: order.tableId || undefined,
      nameSnapshot: name,
      priceSnapshot: price,
      quantity,
    });

    return NextResponse.json(newItem);

  } catch (error) {
    console.error('ORDER ITEM ERROR:', error);

    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 },
    );
  }
}