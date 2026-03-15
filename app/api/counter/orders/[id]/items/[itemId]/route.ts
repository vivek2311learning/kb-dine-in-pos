export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  await requireRole(['counter', 'admin']);
  await connectDB();
  const { itemId } = await context.params;
  const { quantity } = await req.json();

  const item = await OrderItem.findById(itemId);
  if (!item || item.kitchenStatus !== 'draft') {
    return NextResponse.json({ error: 'Not editable' }, { status: 400 });
  }

  if (quantity <= 0) {
    await item.deleteOne();
    return NextResponse.json({ deleted: true });
  }

  item.quantity = quantity;
  await item.save();

  return NextResponse.json(item);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  await connectDB();
  const { itemId } = await context.params;

  await OrderItem.deleteOne({
    _id: itemId,
    kitchenStatus: 'draft',
  });

  return NextResponse.json({ deleted: true });
}
