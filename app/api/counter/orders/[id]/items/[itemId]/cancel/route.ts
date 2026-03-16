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

    /* VALIDATE ID */

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    const item = await OrderItem.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    /* ALREADY CANCELLED */

    if (item.cancelled) {
      return NextResponse.json(
        { error: 'Item already cancelled' },
        { status: 400 },
      );
    }

    /* SERVED ITEMS CANNOT BE CANCELLED */

    if (item.served) {
      return NextResponse.json(
        { error: 'Served item cannot be cancelled' },
        { status: 400 },
      );
    }

    /* DRAFT ITEM → DELETE */

    if (item.kitchenStatus === 'draft') {
      await item.deleteOne();

      return NextResponse.json({
        deleted: true,
        itemId,
      });
    }

    /* NORMAL CANCEL */

    item.cancelled = true;
    item.billable = false;
    item.cancelStage = item.kitchenStatus;
    item.cancelledAt = new Date();

    await item.save();

    return NextResponse.json({
      success: true,
      itemId,
      cancelledStage: item.cancelStage,
    });
  } catch (err) {
    console.error('Cancel Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to cancel item' },
      { status: 500 },
    );
  }
}
