import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  await requireRole(['admin']);
  await connectDB();
  const { orderId } = await context.params;

  const order = await Order.findById(orderId);
  const items = await OrderItem.find({ orderId });

  return NextResponse.json({ order, items });
}
