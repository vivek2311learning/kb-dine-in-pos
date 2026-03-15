export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const filter: any = {};

  if (from && to) {
    filter.printedAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const bills = await Bill.find(filter)
    .sort({ printedAt: -1 })
    .populate({
      path: 'orderId',
      populate: { path: 'tableId' },
    })
    .lean();

  return NextResponse.json(bills);
}
