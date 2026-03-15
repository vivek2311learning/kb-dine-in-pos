export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Order from '@/app/lib/models/order';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { orderId, name, price, quantity } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🔥 Check existing item
    const existingItem = await OrderItem.findOne({
      orderId,
      nameSnapshot: name,
    });

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();
      return NextResponse.json(existingItem);
    }

    // 🔥 Create new item (DRAFT)
    const newItem = await OrderItem.create({
      orderId,
      tableId: order.tableId,
      nameSnapshot: name,
      priceSnapshot: price,
      quantity: quantity || 1,
      kitchenStatus: 'draft',
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('ORDER ITEM ERROR:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
