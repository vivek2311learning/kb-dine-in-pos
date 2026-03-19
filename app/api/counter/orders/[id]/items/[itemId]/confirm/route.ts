

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, context: any) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    /* 🔥 DIRECT ATOMIC UPDATE */
    const updated = await OrderItem.updateOne(
      {
        _id: itemId,
        kitchenStatus: 'draft',
      },
      {
        kitchenStatus: 'pending',
      },
    );

    if (!updated.modifiedCount) {
      return NextResponse.json(
        { error: 'Already confirmed' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      itemId,
      status: 'pending',
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Confirm failed' },
      { status: 500 },
    );
  }
}