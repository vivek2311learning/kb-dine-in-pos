export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';

import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const today = searchParams.get('today');
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);

    const skip = (page - 1) * limit;

    /* ================= FILTER ================= */

    const query: any = {};

    if (status === 'paid') query.isPaid = true;
    if (status === 'unpaid') query.isPaid = false;

    if (today === 'true') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      query.createdAt = { $gte: start };
    }

    /* ================= FETCH ================= */

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'orderId',
          select: 'type parcelNumber tableId',
          populate: {
            path: 'tableId',
            select: 'tableNumber',
          },
        })
        .lean(),

      Bill.countDocuments(query),
    ]);

    /* ================= MAP ================= */

    const result = bills.map((bill: any) => ({
      _id: bill._id,
      billNumber: bill.billNumber,
      totalAmount: bill.totalAmount,
      isPaid: bill.isPaid,
      createdAt: bill.createdAt,

      orderType: bill.orderId?.type || null,
      tableNumber: bill.orderId?.tableId?.tableNumber || null,
      parcelNumber: bill.orderId?.parcelNumber || null,
    }));

    return NextResponse.json({
      data: result,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err: any) {
    console.error('Bills List Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}