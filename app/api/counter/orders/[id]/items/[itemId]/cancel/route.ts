import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

import { requireRole } from '@/app/lib/auth/requireRole';
import { verifyToken } from '@/app/lib/auth/token';

export async function PATCH(
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

    /* ---------------- AUTH ---------------- */

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: any = verifyToken(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    /* ---------------- FIND ITEM ---------------- */

    const item = await OrderItem.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.cancelled) {
      return NextResponse.json(
        { error: 'Item already cancelled' },
        { status: 400 },
      );
    }

    /* ---------------- CANCEL LOGIC ---------------- */

    item.cancelled = true;
    item.billable = false;
    item.cancelStage = item.kitchenStatus;
    item.cancelledBy = new mongoose.Types.ObjectId(payload.userId);
    item.cancelledAt = new Date();

    await item.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cancel Item Error:', err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
