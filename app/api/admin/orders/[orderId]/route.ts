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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await Order.findById(orderId)
      .select(
        '_id status closedReason tableId parcelNumber type createdAt closedAt updatedAt',
      )
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [items, bill] = await Promise.all([
      OrderItem.find({ orderId })
        .select(
          '_id nameSnapshot priceSnapshot quantity kitchenStatus served cancelled wasted',
        )
        .lean(),

      Bill.findOne({ orderId })
        .select('_id billNumber totalAmount isPaid')
        .lean(),
    ]);

    let tableNumber: number | null = null;

    if (order.type === 'dine-in' && order.tableId) {
      const table = await Table.findById(order.tableId)
        .select('tableNumber')
        .lean();

      tableNumber = table?.tableNumber || null;
    }

    let payments: Array<{ method: string; amount: number }> = [];

    if (bill?._id) {
      payments = await Payment.find({ billId: bill._id })
        .select('method amount')
        .lean();
    }

    const total = items.reduce(
      (sum, item: any) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    const servedTotal = items
      .filter((item: any) => item.served === true)
      .reduce((sum, item: any) => sum + item.priceSnapshot * item.quantity, 0);

    const cancelledTotal = items
      .filter((item: any) => item.cancelled === true && item.wasted !== true)
      .reduce((sum, item: any) => sum + item.priceSnapshot * item.quantity, 0);

    const wastedTotal = items
      .filter((item: any) => item.wasted === true)
      .reduce((sum, item: any) => sum + item.priceSnapshot * item.quantity, 0);

    return NextResponse.json({
      _id: order._id,

      status: order.status,
      closedReason: order.closedReason || null,

      orderType: order.type,
      tableNumber,
      parcelNumber: order.type === 'parcel' ? order.parcelNumber || null : null,

      openedAt: order.createdAt,
      closedAt: order.closedAt || order.updatedAt || null,

      billNumber: bill?.billNumber || null,
      totalAmount: bill?.totalAmount || 0,
      isPaid: bill?.isPaid || false,

      summary: {
        total,
        servedTotal,
        cancelledTotal,
        wastedTotal,
      },

      payments,
      items,
    });
  } catch (err: any) {
    console.error('Admin Order Detail Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to load order detail' },
      { status: 500 },
    );
  }
}
