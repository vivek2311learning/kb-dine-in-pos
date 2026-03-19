export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(req: Request, context: any) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;
    const { quantity } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(itemId) ||
      typeof quantity !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    /* 🔥 DELETE DIRECT */
    if (quantity <= 0) {
      const deleted = await OrderItem.deleteOne({
        _id: itemId,
        kitchenStatus: 'draft',
      });

      return NextResponse.json({ deleted: !!deleted.deletedCount });
    }

    /* 🔥 ATOMIC UPDATE */
    const updated = await OrderItem.findOneAndUpdate(
      {
        _id: itemId,
        kitchenStatus: 'draft',
      },
      { $set: { quantity } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: 'Item not editable' },
        { status: 400 },
      );
    }

    return NextResponse.json(updated);

  } catch (err) {
    console.error('Update Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 },
    );
  }
}