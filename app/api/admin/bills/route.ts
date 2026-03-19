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

    const skip = (page - 1) * limit;

    /* ================= FILTER ================= */

    const query: any = {};

    /* ✅ BILL NUMBER */
    if (billNumber) {
      query.billNumber = Number(billNumber);
    }

    /* ✅ DATE FILTER (USE createdAt NOT printedAt) */
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

    /* ================= FETCH ================= */

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('billNumber totalAmount isPaid isRefunded printedAt createdAt')
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

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}