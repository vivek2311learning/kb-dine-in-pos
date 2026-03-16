export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['kitchen', 'admin']);
    await connectDB();

    const { id } = await context.params;
    const { status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    const item = await OrderItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.cancelled || item.wasted || item.served) {
      return NextResponse.json({ error: 'Item not editable' }, { status: 400 });
    }

    const current = item.kitchenStatus;
    const next = status;

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

    return NextResponse.json({
      success: true,
      itemId: id,
      status: next,
    });
  } catch (err) {
    console.error('Kitchen Status Error:', err);

    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 },
    );
  }
}
