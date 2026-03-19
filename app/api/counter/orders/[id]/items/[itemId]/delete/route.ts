
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, context: any) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { itemId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const result = await OrderItem.deleteOne({
      _id: itemId,
      kitchenStatus: 'draft',
    });

    return NextResponse.json({
      deleted: result.deletedCount > 0,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 },
    );
  }
}