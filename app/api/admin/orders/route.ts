export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import mongoose from 'mongoose';

import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const type = searchParams.get('type'); // dine-in | parcel
    const status = searchParams.get('status'); // running | closed
    const orderType = searchParams.get('orderType'); // completed | cancelled | force_closed

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    /* ORDER STATE FILTER */
    if (orderType === 'completed') {
      query.status = 'closed';
      query.closedReason = 'completed';
    } else if (orderType === 'cancelled') {
      query.status = 'closed';
      query.closedReason = 'cancelled';
    } else if (orderType === 'force_closed') {
      query.status = 'closed';
      query.closedReason = 'force_closed';
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'running';
    }

    /* ORDER MODE FILTER */
    if (type === 'dine-in' || type === 'parcel') {
      query.type = type;
    }

    /* DATE FILTER */
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          '_id tableId parcelNumber type status createdAt closedAt closedReason',
        )
        .lean(),

      Order.countDocuments(query),
    ]);

    const tableIds = orders
      .map((order: any) => {
        if (!order.tableId) return null;
        return String(order.tableId);
      })
      .filter((id): id is string => Boolean(id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const tables =
      tableIds.length > 0
        ? await Table.find({ _id: { $in: tableIds } })
            .select('_id tableNumber')
            .lean()
        : [];

    const tableMap = new Map<string, number>();
    tables.forEach((table: any) => {
      tableMap.set(String(table._id), table.tableNumber);
    });

    const data = orders.map((order: any) => ({
      _id: order._id,
      orderType: order.type,
      status: order.status,
      closedReason: order.closedReason || null,
      tableNumber:
        order.type === 'dine-in' && order.tableId
          ? tableMap.get(String(order.tableId)) || null
          : null,
      parcelNumber: order.type === 'parcel' ? order.parcelNumber || null : null,
      openedAt: order.createdAt,
      closedAt: order.closedAt || null,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('Admin Orders Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to load orders' },
      { status: 500 },
    );
  }
}
