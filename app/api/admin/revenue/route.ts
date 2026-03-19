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

    const from = searchParams.get('from');
    const to = searchParams.get('to');

    /* ================= FILTER ================= */

    const match: any = {
      isPaid: true, // 🔥 only paid bills
    };

    if (from || to) {
      match.createdAt = {};

      if (from) {
        match.createdAt.$gte = new Date(from);
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    /* ================= AGGREGATION ================= */

    const bills = await Bill.aggregate([
      { $match: match },

      {
        $project: {
          billNumber: 1,
          totalAmount: 1,
          createdAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },

      { $limit: 100 }, // 🔥 safety limit
    ]);

    return NextResponse.json(bills);

  } catch (err: any) {
    console.error('Revenue API Error:', err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}