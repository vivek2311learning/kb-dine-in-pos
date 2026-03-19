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

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    /* 🔥 PARALLEL FETCH */
    const [order, menuItem] = await Promise.all([
      Order.findById(id)
        .select('_id type tableId')
        .lean(),

      Menu.findById(menuItemId)
        .select('_id name price status')
        .lean(),
    ]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!menuItem || menuItem.status !== 'active') {
      return NextResponse.json(
        { error: 'Menu not available' },
        { status: 400 },
      );
    }

    /* 🔥 ATOMIC INCREMENT */
    const updated = await OrderItem.findOneAndUpdate(
      {
        orderId: order._id,
        menuItemId: menuItem._id,
        kitchenStatus: 'draft',
        cancelled: false,
      },
      {
        $inc: { quantity: 1 },
      },
      {
        new: true,
      },
    );

    if (updated) return NextResponse.json(updated);

    /* CREATE NEW */
    const newItem = await OrderItem.create({
      orderId: order._id,
      menuItemId: menuItem._id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      quantity: 1,
      tableId: order.tableId || undefined,
    });

    return NextResponse.json(newItem);

  } catch (err: any) {
    console.error('Add Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 },
    );
  }
}