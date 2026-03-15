export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { searchParams } = new URL(req.url);

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter: any = {};

  if (from && to) {
    dateFilter.printedAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  /* ===================== */
  /* BILLS SUMMARY */
  /* ===================== */

  const bills = await Bill.find(dateFilter);

  const totalBills = bills.length;

  const totalRevenue = bills
    .filter((b) => !b.isRefunded)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const refundCount = bills.filter((b) => b.isRefunded).length;

  const refundAmount = bills
    .filter((b) => b.isRefunded)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  /* ===================== */
  /* WASTAGE SUMMARY */
  /* ===================== */

  const wastedItems = await OrderItem.find({
    wasted: true,
  });

  const wastageCount = wastedItems.length;

  const wastageValue = wastedItems.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0,
  );

  return NextResponse.json({
    totalBills,
    totalRevenue,
    refundCount,
    refundAmount,
    wastageCount,
    wastageValue,
  });
}
