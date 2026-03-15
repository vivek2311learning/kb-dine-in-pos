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
    const body = await req.json();

    console.log('OrderId:', id);
    console.log('Body:', body);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 400 });
    }

    const menuItem = await Menu.findById(body.menuItemId);
    if (!menuItem) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 400 });
    }

    const item = await OrderItem.create({
      orderId: id,
      tableId: order.tableId, // 🔥 important
      menuItemId: menuItem._id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      quantity: 1,
      kitchenStatus: 'draft',
    });

    return NextResponse.json(item);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
