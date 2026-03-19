export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';

import Order from '@/app/lib/models/order';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Feedback from '@/app/lib/models/Feedback'; // ✅ ADD
import User from '@/app/lib/models/User'; // ✅ ADD

export async function GET() {
  try {
    await connectDB();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

const [
  totalTables,
  freeTables,
  occupiedTables,

  runningOrders,
  closedOrders, // 🔥 FIXED

  unservedItems,
  readyItems,

  pendingBills,
  todaysBills,
  todayRevenueAgg,

  activeStaff,
  feedbackAgg,

] = await Promise.all([

  Table.countDocuments(),
  Table.countDocuments({ status: 'free' }),
  Table.countDocuments({ status: 'occupied' }),

  Order.countDocuments({ status: 'running' }),

  /* 🔥 ONLY PAID (NO CANCELLED) */
  Bill.countDocuments({ isPaid: true }),

  OrderItem.countDocuments({
    served: false,
    cancelled: false,
    wasted: false,
  }),

  OrderItem.countDocuments({
    kitchenStatus: 'ready',
    served: false,
    cancelled: false,
    wasted: false,
  }),

  Bill.countDocuments({ isPaid: false }),

  Bill.countDocuments({
    createdAt: { $gte: startOfDay },
  }),

  Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]),

  User.countDocuments({
    role: { $in: ['counter', 'kitchen'] },
    isActive: true,
  }),

  Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        total: { $sum: 1 },
      },
    },
  ]),
]);

    return NextResponse.json({
      tables: {
        totalTables,
        freeTables,
        occupiedTables,
      },

      orders: {
        runningOrders,
        closedOrders,
        unservedItems,
        readyItems,
      },

      revenue: {
        pendingBills,
        todaysBills,
        todayRevenue: todayRevenueAgg[0]?.total || 0,
      },

      /* 🔥 NEW */
      staff: {
        activeStaff,
      },

      feedback: {
        avgRating: feedbackAgg[0]?.avgRating || 0,
        totalFeedback: feedbackAgg[0]?.total || 0,
      },
    });

  } catch (err: any) {
    console.error('Analytics Error:', err);

    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 },
    );
  }
}