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
      return NextResponse.json(
        { error: 'Invalid item id' },
        { status: 400 }
      );
    }

    /* 🔥 ALLOWED TRANSITIONS */
    const transitions: any = {
      pending: 'preparing',
      preparing: 'ready',
    };

    const prev = Object.keys(transitions).find(
      (key) => transitions[key] === status
    );

    if (!prev) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    /* 🔥 ATOMIC UPDATE */
    const result = await OrderItem.updateOne(
      {
        _id: id,
        kitchenStatus: prev,
        cancelled: false,
        wasted: false,
        served: false,
      },
      {
        kitchenStatus: status,
      }
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: 'Invalid transition or item locked' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      itemId: id,
      status,
    });

  } catch (err) {
    console.error('Kitchen Status Error:', err);

    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}