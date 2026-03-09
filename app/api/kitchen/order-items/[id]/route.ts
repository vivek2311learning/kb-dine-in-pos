import { NextResponse } from 'next/server';
import OrderItem from '@/app/lib/models/orderItem';
import { connectDB } from '@/app/lib/db';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['kitchen', 'admin']);
  await connectDB();

  const { id } = await context.params;
  const { status } = await req.json();

  const item = await OrderItem.findById(id);

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const current = item.kitchenStatus?.toLowerCase();
  const next = status?.toLowerCase();

  const allowedTransitions: any = {
    pending: 'preparing',
    preparing: 'ready',
  };

  if (allowedTransitions[current] !== next) {
    return NextResponse.json(
      { error: `Invalid transition from ${current} to ${next}` },
      { status: 400 },
    );
  }

  item.kitchenStatus = next;
  await item.save();

  return NextResponse.json(item);
}
