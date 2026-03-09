import { NextResponse } from 'next/server';
import Feedback from '@/app/lib/models/Feedback';
import Order from '@/app/lib/models/order';
import Table from '@/app/lib/models/Table';
import { connectDB } from '@/app/lib/db';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { orderId, rating, comment } = await req.json();

    console.log('Incoming orderId:', orderId);

    const order = await Order.findById(orderId);

    if (!order || order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Invalid order for feedback' },
        { status: 400 },
      );
    }

    // Create feedback
    const feedback = await Feedback.create({
      orderId,
      rating,
      comment,
    });

    // Close order
    order.status = 'closed';
    order.closedAt = new Date();
    await order.save();

    // Free table
    await Table.findByIdAndUpdate(order.tableId, {
      status: 'free',
      currentOrderId: null,
    });

    return NextResponse.json(feedback);
  } catch (err: any) {
    console.error('Feedback Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
