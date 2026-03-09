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
    /* ================= AUTH GUARD ================= */
    await requireRole(['admin']);

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ================= FEEDBACK STATS ================= */

    const feedbacks = await Feedback.find();

    const totalFeedback = feedbacks.length;

    const avgRating =
      totalFeedback === 0
        ? 0
        : Number(
            (
              feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
            ).toFixed(1),
          );

    const ratingCounts = {
      5: feedbacks.filter((f) => f.rating === 5).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      1: feedbacks.filter((f) => f.rating === 1).length,
    };

    /* ================= TODAY REVENUE ================= */

    const todaysBills = await Bill.find({
      createdAt: { $gte: today },
      isPaid: true,
      isRefunded: false, // 🔥 Important
    });

    const todayRevenue = todaysBills.reduce((sum, b) => sum + b.totalAmount, 0);

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
        totalFeedback,
        avgRating,
        ratingCounts,
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
    });
  } catch (err: any) {
    console.error('Analytics Error:', err);

    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 },
    );
  }
}
