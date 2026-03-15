export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { requireRole } from '@/app/lib/auth/requireRole';
import Feedback from '@/app/lib/models/Feedback';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';

export async function GET() {
  try {
    await requireRole(['admin']);
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ================= FEEDBACK ANALYTICS ================= */

    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const feedback = feedbackStats[0] || {
      total: 0,
      avgRating: 0,
      r5: 0,
      r4: 0,
      r3: 0,
      r2: 0,
      r1: 0,
    };

    /* ================= TODAY BILLS ================= */

    const todaysBills = await Bill.find({
      createdAt: { $gte: today },
    }).lean();

    const todayRevenue = todaysBills
      .filter((b) => b.isPaid && !b.isRefunded)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    /* ================= TOP ITEMS ================= */

    const topItems = await OrderItem.aggregate([
      {
        $match: {
          cancelled: false,
          wasted: false,
        },
      },
      {
        $group: {
          _id: '$nameSnapshot',
          totalSold: { $sum: '$quantity' },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    /* ================= WASTAGE ================= */

    const wastageAgg = await OrderItem.aggregate([
      {
        $match: { wasted: true },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          value: {
            $sum: {
              $multiply: ['$priceSnapshot', '$quantity'],
            },
          },
        },
      },
    ]);

    const wastage = wastageAgg[0] || {
      count: 0,
      value: 0,
    };

    /* ================= TABLE STATS ================= */

    const totalTables = await Table.countDocuments();

    const occupiedTables = await Table.countDocuments({
      status: 'occupied',
    });

    /* ================= ORDER STATS ================= */

    const runningOrders = await Order.countDocuments({
      status: 'running',
    });

    const closedOrders = await Order.countDocuments({
      status: 'closed',
    });

    const unservedItems = await OrderItem.countDocuments({
      served: false,
      cancelled: false,
    });

    return NextResponse.json({
      feedback: {
        totalFeedback: feedback.total,
        avgRating: Number((feedback.avgRating || 0).toFixed(1)),
        ratingCounts: {
          5: feedback.r5,
          4: feedback.r4,
          3: feedback.r3,
          2: feedback.r2,
          1: feedback.r1,
        },
      },

      revenue: {
        todayRevenue,
        todaysBills: todaysBills.length,
      },

      tables: {
        totalTables,
        occupiedTables,
        freeTables: totalTables - occupiedTables,
      },

      orders: {
        runningOrders,
        closedOrders,
        unservedItems,
      },

      insights: {
        topItems,
        wastageItems: wastage.count,
        wastageValue: wastage.value,
      },
    });
  } catch (err: any) {
    console.error('Analytics Error:', err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
