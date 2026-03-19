
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

    /* 🔥 GET MINIMAL DATA */
    const item = await OrderItem.findById(itemId)
      .select('kitchenStatus served cancelled')
      .lean();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.cancelled) {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });
    }

    if (item.served) {
      return NextResponse.json({ error: 'Served item' }, { status: 400 });
    }

    /* 🔥 DRAFT → DELETE */
    if (item.kitchenStatus === 'draft') {
      await OrderItem.deleteOne({ _id: itemId });
      return NextResponse.json({ deleted: true });
    }

    /* 🔥 ATOMIC UPDATE */
    await OrderItem.updateOne(
      { _id: itemId },
      {
        cancelled: true,
        billable: false,
        cancelStage: item.kitchenStatus,
        cancelledAt: new Date(),
      },
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Cancel failed' },
      { status: 500 },
    );
  }
}