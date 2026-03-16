export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Menu from '@/app/lib/models/MenuItem';
import Order from '@/app/lib/models/order';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params;
    const { menuItemId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item id' },
        { status: 400 },
      );
    }

    /* Fetch order */

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* Fetch menu item */

    const menuItem = await Menu.findById(menuItemId).lean();

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    if (menuItem.status !== 'active') {
      return NextResponse.json(
        { error: 'Menu item not available' },
        { status: 400 },
      );
    }

    /* Create order item */

    const item = await OrderItem.create({
      orderId: id,
      tableId: order.tableId || undefined,
      menuItemId: menuItem._id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      quantity: 1,
    });

    return NextResponse.json(item);
  } catch (err: any) {
    console.error('Add Item Error:', err);

    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
