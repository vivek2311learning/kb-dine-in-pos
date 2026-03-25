export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const readyParcels = await OrderItem.aggregate([
      {
        $match: {
          kitchenStatus: 'ready',
          served: false,
          cancelled: false,
          wasted: false,
        },
      },
      {
        $group: {
          _id: '$orderId',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: '_id',
          as: 'order',
        },
      },
      {
        $unwind: '$order',
      },
      {
        $match: {
          'order.type': 'parcel',
          'order.status': 'running',
        },
      },
      {
        $project: {
          _id: '$order._id',
          parcelNumber: '$order.parcelNumber',
        },
      },
      {
        $sort: {
          parcelNumber: 1,
        },
      },
    ]);

    return NextResponse.json(readyParcels);
  } catch (err) {
    console.error('Ready Parcel Fetch Error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch ready parcels' },
      { status: 500 },
    );
  }
}
