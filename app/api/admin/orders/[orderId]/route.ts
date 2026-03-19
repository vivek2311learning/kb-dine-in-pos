export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';

import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Bill from '@/app/lib/models/bill';
import Payment from '@/app/lib/models/payment';
import Table from '@/app/lib/models/Table';

import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { orderId } = await context.params;

    /* ✅ VALIDATION */
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order id' },
        { status: 400 }
      );
    }

    /* ⚡ ORDER (LEAN + LIGHT) */
    const order = await Order.findById(orderId)
      .select('status tableId parcelNumber type createdAt closedAt updatedAt')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    /* ⚡ PARALLEL FETCH */
    const [items, bill] = await Promise.all([
      OrderItem.find({
        orderId,
        cancelled: false,
      })
        .select('nameSnapshot priceSnapshot quantity served')
        .lean(),

      Bill.findOne({ orderId })
        .select('billNumber totalAmount isPaid _id')
        .lean(),
    ]);

    /* ⚡ TABLE FETCH (ONLY IF NEEDED) */
    let tableNumber: number | null = null;

    if (order.type === 'dine-in' && order.tableId) {
      const table = await Table.findById(order.tableId)
        .select('tableNumber')
        .lean();

      tableNumber = table?.tableNumber || null;
    }

    /* ⚡ PAYMENTS */
    let payments: any[] = [];

    if (bill?._id) {
      payments = await Payment.find({ billId: bill._id })
        .select('method amount')
        .lean();
    }

    /* 🔥 FINAL CLEAN RESPONSE */
    return NextResponse.json({
      _id: order._id,
      status: order.status,

      tableNumber,
      parcelNumber: order.type === 'parcel' ? order.parcelNumber : null,

      openedAt: order.createdAt,
      closedAt: order.closedAt || order.updatedAt,

      billNumber: bill?.billNumber || null,
      totalAmount: bill?.totalAmount || 0,
      isPaid: bill?.isPaid || false,

      payments,
      items,
    });

  } catch (err: any) {
    console.error('Admin Order Detail Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}