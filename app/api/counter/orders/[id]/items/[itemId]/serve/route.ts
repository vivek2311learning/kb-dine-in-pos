export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const result = await OrderItem.updateOne(
      {
        _id: itemId,
        cancelled: false,
        wasted: false,
        served: false,
        kitchenStatus: 'ready',
      },
      {
        served: true,
        kitchenStatus: 'served',
      },
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: 'Item not eligible for serving' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      itemId,
    });

  } catch (err) {
    console.error('Serve Item Error:', err);

    return NextResponse.json(
      { error: 'Failed to serve item' },
      { status: 500 },
    );
  }
}