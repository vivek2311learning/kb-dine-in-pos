export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    /* ---------- AUTH ---------- */

    await requireRole(['kitchen', 'counter', 'admin']);

    /* ---------- DB ---------- */

    await connectDB();

    /* ---------- FETCH ITEMS ---------- */

    const items = await OrderItem.find({
      cancelled: false,
      wasted: false,
      kitchenStatus: { $in: ['pending', 'preparing', 'ready'] },
    })
      .populate({
        path: 'tableId',
        select: 'tableNumber',
      })
      .populate({
        path: 'orderId',
        select: 'parcelNumber type',
      })
      .sort({ createdAt: 1 })
      .lean();

    /* ---------- FORMAT RESULT ---------- */

    const result = items.map((item: any) => ({
      ...item,

      tableLabel: item.tableId?.tableNumber
        ? `Table ${item.tableId.tableNumber}`
        : `Parcel #${item.orderId?.parcelNumber}`,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Kitchen Orders Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch kitchen items' },
      { status: 500 },
    );
  }
}
