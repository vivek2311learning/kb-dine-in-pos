export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const match: any = {};

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  /* ================= REVENUE ================= */

  const revenueAgg = await Bill.aggregate([
    { $match: { ...match, isPaid: true } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        refund: {
          $sum: {
            $cond: ['$isRefunded', '$totalAmount', 0],
          },
        },
      },
    },
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const totalRefund = revenueAgg[0]?.refund || 0;

  /* ================= ORDERS ================= */

  const totalOrders = await Order.countDocuments(match);
  const runningOrders = await Order.countDocuments({
    ...match,
    status: 'running',
  });
  const closedOrders = await Order.countDocuments({
    ...match,
    status: 'closed',
  });

  /* ================= TOP SELLING ITEMS ================= */

  const topSelling = await OrderItem.aggregate([
    { $match: { cancelled: false } },
    {
      $group: {
        _id: '$nameSnapshot',
        quantity: { $sum: '$quantity' },
        revenue: {
          $sum: {
            $multiply: ['$priceSnapshot', '$quantity'],
          },
        },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
  ]);

  /* ================= MOST CANCELLED ================= */

  const mostCancelled = await OrderItem.aggregate([
    { $match: { cancelled: true } },
    {
      $group: {
        _id: '$nameSnapshot',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  /* ================= DAILY TIMELINE ================= */

  const timeline = await Bill.aggregate([
    { $match: { ...match, isPaid: true } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        revenue: { $sum: '$totalAmount' },
        bills: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      refund: totalRefund,
      net: totalRevenue - totalRefund,
    },
    orders: {
      total: totalOrders,
      running: runningOrders,
      closed: closedOrders,
    },
    items: {
      topSelling,
      mostCancelled,
    },
    timeline,
  });
}
