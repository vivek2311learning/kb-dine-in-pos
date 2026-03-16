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
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;
    const { quantity } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    if (typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const item = await OrderItem.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    /* Only draft items editable */

    if (item.kitchenStatus !== 'draft') {
      return NextResponse.json(
        { error: 'Item cannot be edited' },
        { status: 400 },
      );
    }

    /* Remove item if qty <= 0 */

    if (quantity <= 0) {
      await item.deleteOne();

      return NextResponse.json({ deleted: true });
    }

    item.quantity = quantity;

    await item.save();

    return NextResponse.json(item);
  } catch (err) {
    console.error('Update Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    const result = await OrderItem.deleteOne({
      _id: itemId,
      kitchenStatus: 'draft',
    });

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Item not deleted' }, { status: 400 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Delete Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 },
    );
  }
}
