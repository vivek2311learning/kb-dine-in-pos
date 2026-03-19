export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Order from '@/app/lib/models/order';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['kitchen', 'counter', 'admin']);
    await connectDB();

    /* 🔥 STEP 1: FETCH ITEMS (LIGHT) */
    const items = await OrderItem.find({
      cancelled: false,
      wasted: false,
      kitchenStatus: { $in: ['pending', 'preparing', 'ready'] },
    })
      .select('_id nameSnapshot quantity kitchenStatus tableId orderId')
      .sort({ createdAt: 1 })
      .lean();

    /* 🔥 STEP 2: COLLECT IDS */
    const tableIds = items
      .map((i: any) => i.tableId)
      .filter(Boolean);

    const orderIds = items
      .map((i: any) => i.orderId)
      .filter(Boolean);

    /* 🔥 STEP 3: BULK FETCH (NO POPULATE) */
    const [tables, orders] = await Promise.all([
      Table.find({ _id: { $in: tableIds } })
        .select('_id tableNumber')
        .lean(),

      Order.find({ _id: { $in: orderIds } })
        .select('_id type parcelNumber')
        .lean(),
    ]);

    /* 🔥 STEP 4: MAP LOOKUP */
    const tableMap = new Map(
      tables.map((t: any) => [t._id.toString(), t.tableNumber])
    );

    const orderMap = new Map(
      orders.map((o: any) => [o._id.toString(), o])
    );

    /* 🔥 STEP 5: FINAL FORMAT */
    const result = items.map((item: any) => {
      let label = 'Order';

      const order = orderMap.get(item.orderId?.toString());
      const tableNumber = tableMap.get(item.tableId?.toString());

      if (order?.type === 'parcel') {
        label = `Parcel #${order.parcelNumber}`;
      }

      if (tableNumber) {
        label = `Table ${tableNumber}`;
      }

      return {
        ...item,
        tableLabel: label,
      };
    });

    return NextResponse.json(result);

  } catch (err: any) {
    console.error('Kitchen Orders Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch kitchen items' },
      { status: 500 }
    );
  }
}