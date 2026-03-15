export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Table from '@/app/lib/models/Table';
import OrderItem from '@/app/lib/models/orderItem';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const freeTables = await Table.countDocuments({ status: 'free' });
  const occupiedTables = await Table.countDocuments({ status: 'occupied' });

  const unservedItems = await OrderItem.countDocuments({
    cancelled: false,
    served: false,
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayBills = await Bill.countDocuments({
    createdAt: { $gte: todayStart },
  });

  return NextResponse.json({
    freeTables,
    occupiedTables,
    unservedItems,
    todayBills,
  });
}
