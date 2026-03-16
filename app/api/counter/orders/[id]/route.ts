export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
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

    /* Fetch order */

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* Fetch order items */

    const items = await OrderItem.find({
      orderId: id,
      cancelled: { $ne: true },
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      order,
      items,
    });
  } catch (err: any) {
    console.error('Order Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}
