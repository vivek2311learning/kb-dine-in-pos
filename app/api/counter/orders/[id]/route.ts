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

    const [order, items] = await Promise.all([
      Order.findById(id)
        .select('_id type status tableId parcelNumber')
        .populate('tableId', 'tableNumber')
        .lean(),

      OrderItem.find({
        orderId: id,
        cancelled: false,
      })
        .select('_id nameSnapshot priceSnapshot quantity kitchenStatus served')
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order, items });
  } catch (err: any) {
    console.error('Order Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}
