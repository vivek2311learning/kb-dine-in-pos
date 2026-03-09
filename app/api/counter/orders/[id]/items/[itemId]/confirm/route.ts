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

  const item = await OrderItem.findById(itemId);
  if (!item || item.kitchenStatus !== 'draft') {
    return NextResponse.json({ error: 'Cannot confirm' }, { status: 400 });
  }

  item.kitchenStatus = 'pending';
  await item.save();

  return NextResponse.json({ success: true });
}
