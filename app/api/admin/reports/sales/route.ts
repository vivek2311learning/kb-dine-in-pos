export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Payment from '@/app/lib/models/payment';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const match: any = {
      isPaid: true,
    };

    if (from && to) {
      match.printedAt = {
        $gte: new Date(from),
        $lte: new Date(to + 'T23:59:59.999Z'),
      };
    }

    // ---------------- TOTAL SALES ----------------
    const bills = await Bill.find(match);

    const totalRevenue = bills.reduce(
      (sum, b) => sum + (b.isRefunded ? 0 : b.totalAmount),
      0,
    );

    const totalRefunded = bills.reduce(
      (sum, b) => sum + (b.isRefunded ? b.totalAmount : 0),
      0,
    );

    const totalBills = bills.length;

    // ---------------- PAYMENT BREAKDOWN ----------------
    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: 'bills',
          localField: 'billId',
          foreignField: '_id',
          as: 'bill',
        },
      },
      { $unwind: '$bill' },
      { $match: match },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
        },
      },
    ]);

    return NextResponse.json({
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      totalBills,
      payments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
