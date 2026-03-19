export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(req: Request, context: any) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params;

    const order = await Order.findById(id)
      .select('status tableId')
      .lean();

    if (!order || order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Invalid order state' },
        { status: 400 },
      );
    }

    await Order.updateOne(
      { _id: id },
      {
        status: 'closed',
        closedAt: new Date(),
        closedReason: 'completed',
      },
    );

    if (order.tableId) {
      await Table.updateOne(
        { _id: order.tableId },
        { status: 'free', currentOrderId: null },
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}