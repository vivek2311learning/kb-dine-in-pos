export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const items = await OrderItem.find({
      cancelled: false,
      wasted: false,
      served: false, // ✅ ONLY UNSERVED
      kitchenStatus: { $in: ['pending', 'preparing', 'ready'] },
    })
      .populate({ path: 'tableId', select: 'tableNumber' })
      .populate({ path: 'orderId', select: 'parcelNumber type' })
      .sort({ createdAt: 1 })
      .lean();

    const result = items.map((item: any) => {
      let label = 'Order';

      if (item.orderId?.type === 'parcel') {
        label = `Parcel #${item.orderId.parcelNumber}`;
      }

      if (item.tableId?.tableNumber) {
        label = `Table ${item.tableId.tableNumber}`;
      }

      return {
        ...item,
        tableLabel: label,
      };
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error('Unserved Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch unserved items' },
      { status: 500 },
    );
  }
}