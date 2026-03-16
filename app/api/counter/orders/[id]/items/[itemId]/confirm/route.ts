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

    /* Validate ID */

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    /* Find item */

    const item = await OrderItem.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    /* Only draft items can be confirmed */

    if (item.kitchenStatus !== 'draft') {
      return NextResponse.json(
        { error: 'Item already confirmed' },
        { status: 400 },
      );
    }

    /* Update status */

    item.kitchenStatus = 'pending';

    await item.save();

    return NextResponse.json({
      success: true,
      itemId,
      status: 'pending',
    });
  } catch (err) {
    console.error('Confirm Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to confirm item' },
      { status: 500 },
    );
  }
}
