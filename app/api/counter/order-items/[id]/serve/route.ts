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
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    const item = await OrderItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.cancelled || item.wasted) {
      return NextResponse.json(
        { error: 'Item cannot be served' },
        { status: 400 },
      );
    }

    if (item.served) {
      return NextResponse.json(
        { error: 'Item already served' },
        { status: 400 },
      );
    }

    if (item.kitchenStatus !== 'ready') {
      return NextResponse.json(
        { error: 'Item not ready yet' },
        { status: 400 },
      );
    }

    item.served = true;
    item.kitchenStatus = 'served';

    await item.save();

    return NextResponse.json({
      success: true,
      itemId: id,
    });
  } catch (err) {
    console.error('Serve Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to serve item' },
      { status: 500 },
    );
  }
}
