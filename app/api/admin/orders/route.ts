export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';

import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const billNumber = searchParams.get('billNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    /* 🔥 FILTER */
    const query: any = { isPaid: true };

    if (billNumber) {
      query.billNumber = Number(billNumber);
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) query.createdAt.$gte = new Date(startDate);

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    /* 🔥 BILLS */
    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('orderId billNumber totalAmount isPaid createdAt')
        .lean(),

      Bill.countDocuments(query),
    ]);

    /* 🔥 ORDERS */
    const orderIds = bills.map((b) => b.orderId);

    const orders = await Order.find({
      _id: { $in: orderIds },
    })
      .select('tableId parcelNumber type openedAt closedAt')
      .lean();

    /* 🔥 TABLE IDS CLEAN */
    const tableIds = orders
  .map((o) => {
    if (!o.tableId) return null;

    // अगर populated object है
    if (typeof o.tableId === 'object') {
      return o.tableId._id;
    }

    return o.tableId;
  })
  .filter(
    (id) =>
      id &&
      mongoose.Types.ObjectId.isValid(id.toString())
  );

    const tables = await Table.find({
      _id: { $in: tableIds },
    })
      .select('tableNumber')
      .lean();

    /* 🔥 MAP (FAST) */
    const orderMap = new Map();
    orders.forEach(o => orderMap.set(o._id.toString(), o));

    const tableMap = new Map();
    tables.forEach(t => tableMap.set(t._id.toString(), t));

    const result = bills.map((bill) => {
      const order: any = orderMap.get(bill.orderId.toString());

      let tableNumber = null;
      let parcelNumber = null;

      if (order?.type === 'dine-in' && order.tableId) {
        const table = tableMap.get(order.tableId.toString());
        tableNumber = table?.tableNumber || null;
      }

      if (order?.type === 'parcel') {
        parcelNumber = order?.parcelNumber || null;
      }

      return {
        _id: order?._id,
        billNumber: bill.billNumber,
        totalAmount: bill.totalAmount,
        isPaid: bill.isPaid,
        orderType: order?.type,
        tableNumber,
        parcelNumber,
        openedAt: order?.openedAt,
        closedAt: order?.closedAt,
      };
    });

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err: any) {
    console.error('Admin Orders Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}