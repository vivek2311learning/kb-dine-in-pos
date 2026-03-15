export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const todayBills = await Bill.countDocuments({
    printedAt: { $gte: start, $lte: end },
  });

  return NextResponse.json({
    todayBills,
  });
}
