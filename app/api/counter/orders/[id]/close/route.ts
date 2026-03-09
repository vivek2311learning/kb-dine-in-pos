import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['counter', 'admin']);
  await connectDB();
  const { id } = await context.params;

  const order = await Order.findById(id);
  if (!order || order.status !== 'paid') {
    return NextResponse.json({ error: 'Not ready' }, { status: 400 });
  }

  order.status = 'closed';
  await order.save();

  await Table.findByIdAndUpdate(order.tableId, {
    status: 'free',
    currentOrderId: null,
  });

  return NextResponse.json({ success: true });
}
