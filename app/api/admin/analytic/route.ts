export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';

import Order from '@/app/lib/models/order';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Feedback from '@/app/lib/models/Feedback';
import User from '@/app/lib/models/User';

export async function GET() {
  try {
    await connectDB();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const KITCHEN_PENDING_STATUSES = ['confirmed', 'pending', 'preparing'];

    const [
      totalTables,
      freeTables,
      occupiedTables,

      currentParcel,
      lastDeliveredParcel,

      runningTableOrders,
      runningParcelOrders,

      completedOrders,
      forceClosedOrders,

      unservedItems,
      readyItems,

      pendingBills,
      todaysBills,
      todayRevenueAgg,

      wastageAgg,

      activeStaff,
      feedbackAgg,
    ] = await Promise.all([
      /* TABLES */
      Table.countDocuments(),
      Table.countDocuments({ status: 'free' }),
      Table.countDocuments({ status: 'occupied' }),

      /* PARCEL NUMBERS */
      Order.findOne({
        type: 'parcel',
        status: 'running',
        parcelDelivered: false,
      })
        .sort({ parcelNumber: -1 })
        .select('parcelNumber')
        .lean(),

      Order.findOne({
        type: 'parcel',
        parcelDelivered: true,
      })
        .sort({ parcelNumber: -1 })
        .select('parcelNumber')
        .lean(),

      /* RUNNING ORDERS */
      Order.countDocuments({
        status: 'running',
        type: 'dine-in',
      }),

      Order.countDocuments({
        status: 'running',
        type: 'parcel',
        parcelDelivered: false,
      }),

      /* CLOSED ORDERS */
      Order.countDocuments({
        status: 'closed',
        closedReason: 'completed',
      }),

      Order.countDocuments({
        status: 'closed',
        closedReason: 'force_closed',
      }),

      /* KITCHEN PENDING ITEMS */
      OrderItem.countDocuments({
        kitchenStatus: { $in: KITCHEN_PENDING_STATUSES },
        served: false,
        cancelled: false,
        wasted: false,
      }),

      /* READY ITEMS */
      OrderItem.countDocuments({
        kitchenStatus: 'ready',
        served: false,
        cancelled: false,
        wasted: false,
      }),

      /* BILLING */
      Bill.countDocuments({
        isPaid: false,
        isRefunded: false,
      }),

      Bill.countDocuments({
        createdAt: { $gte: startOfDay },
      }),

      Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay },
            isPaid: true,
            isRefunded: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),

      /* WASTAGE VALUE */
      OrderItem.aggregate([
        {
          $match: {
            wasted: true,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: ['$priceSnapshot', '$quantity'],
              },
            },
          },
        },
      ]),

      /* STAFF */
      User.countDocuments({
        role: { $in: ['counter', 'kitchen'] },
        isActive: true,
      }),

      /* FEEDBACK */
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

      parcel: {
        currentParcelNumber: currentParcel?.parcelNumber || 0,
        lastDeliveredParcelNumber: lastDeliveredParcel?.parcelNumber || 0,
      },

      orders: {
        runningTableOrders,
        runningParcelOrders,
        completedOrders,
        forceClosedOrders,
        unservedItems,
        readyItems,
      },

      revenue: {
        pendingBills,
        todaysBills,
        todayRevenue: todayRevenueAgg[0]?.total || 0,
      },

      wastage: {
        totalWastageValue: wastageAgg[0]?.total || 0,
      },

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
