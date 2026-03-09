import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const { id } = await context.params;

  const item = await OrderItem.findById(id);

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (item.served) {
    return NextResponse.json({ error: 'Item already served' }, { status: 400 });
  }

  item.served = true;
  item.kitchenStatus = 'served';

  await item.save();

  return NextResponse.json(item);
}
