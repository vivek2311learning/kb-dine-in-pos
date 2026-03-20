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

    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const billNumber = searchParams.get('billNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const pending = searchParams.get('pending');
    const today = searchParams.get('today');

    const skip = (page - 1) * limit;

    const query: any = {};

    if (billNumber) {
      query.billNumber = Number(billNumber);
    }

    if (pending === 'true') {
      query.isPaid = false;
      query.isRefunded = false;
    }

    if (today === 'true') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    if (startDate || endDate) {
      query.createdAt = query.createdAt || {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'orderId billNumber totalAmount isPaid isRefunded printedAt createdAt',
        )
        .lean(),

      Bill.countDocuments(query),
    ]);

    return NextResponse.json({
      data: bills,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('Bills API Error:', err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
