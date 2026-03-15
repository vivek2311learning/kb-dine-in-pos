export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  /* ===========================
     TOP 4 MOST SOLD ITEMS
  ============================ */

  const topItems = await OrderItem.aggregate([
    {
      $match: {
        cancelled: false,
        billable: true,
        kitchenStatus: 'served',
      },
    },
    {
      $group: {
        _id: '$nameSnapshot',
        totalSold: { $sum: '$quantity' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 4 },
  ]);

  /* ===========================
     TOP REVENUE DAYS
  ============================ */

  const revenueDays = await Bill.aggregate([
    {
      $match: {
        isPaid: true,
        isRefunded: false,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
        },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  return NextResponse.json({
    topItems,
    revenueDays,
  });
}
