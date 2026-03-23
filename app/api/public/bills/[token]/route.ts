export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import mongoose from 'mongoose';

import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Payment from '@/app/lib/models/payment';

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();

    const { token } = await context.params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const bill = await Bill.findOne({ shareToken: token })
      .select(
        '_id billNumber orderId subtotal tax discount adjustAmount totalAmount customerPhone isPaid paidAt isRefunded refundAmount refundReason refundAt printedAt createdAt',
      )
      .lean();

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const [order, items, payments] = await Promise.all([
      Order.findById(bill.orderId)
        .select(
          'type tableId parcelNumber status closedReason createdAt closedAt',
        )
        .lean(),

      OrderItem.find({
        orderId: bill.orderId,
        served: true,
        cancelled: false,
      })
        .select('nameSnapshot priceSnapshot quantity')
        .sort({ createdAt: 1 })
        .lean(),

      Payment.find({ billId: bill._id }).select('method amount').lean(),
    ]);

    let tableNumber: number | null = null;

    if (order?.type === 'dine-in' && order.tableId) {
      const tableId =
        typeof order.tableId === 'object' &&
        order.tableId !== null &&
        '_id' in order.tableId
          ? String((order.tableId as any)._id)
          : String(order.tableId);

      if (mongoose.Types.ObjectId.isValid(tableId)) {
        const table = await Table.findById(tableId)
          .select('tableNumber')
          .lean();

        tableNumber = table?.tableNumber || null;
      }
    }

    return NextResponse.json({
      bill: {
        _id: bill._id,
        billNumber: bill.billNumber,
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        discount: bill.discount || 0,
        adjustAmount: bill.adjustAmount || 0,
        totalAmount: bill.totalAmount || 0,
        customerPhone: bill.customerPhone || '',
        isPaid: !!bill.isPaid,
        paidAt: bill.paidAt || null,
        isRefunded: !!bill.isRefunded,
        refundAmount: bill.refundAmount || 0,
        refundReason: bill.refundReason || '',
        refundAt: bill.refundAt || null,
        printedAt: bill.printedAt || null,
        createdAt: bill.createdAt || null,
      },

      order: {
        _id: order?._id || null,
        type: order?.type || null,
        parcelNumber:
          order?.type === 'parcel' ? order?.parcelNumber || null : null,
        tableNumber,
        status: order?.status || null,
        closedReason: order?.closedReason || null,
        openedAt: order?.createdAt || null,
        closedAt: order?.closedAt || null,
      },

      items,

      payments,
    });
  } catch (err: any) {
    console.error('Public Bill Fetch Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to load bill' },
      { status: 500 },
    );
  }
}
