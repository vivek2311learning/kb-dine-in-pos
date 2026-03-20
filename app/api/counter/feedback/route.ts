export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Feedback from '@/app/lib/models/Feedback';
import Order from '@/app/lib/models/order';
import { connectDB } from '@/app/lib/db';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { orderId, rating, comment } = await req.json();

    console.log('Incoming orderId:', orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 },
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId)
      .select('_id status closedReason')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'closed' || order.closedReason !== 'completed') {
      return NextResponse.json(
        { error: 'Feedback allowed only for completed orders' },
        { status: 400 },
      );
    }

    const existing = await Feedback.findOne({ orderId }).select('_id').lean();

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this order' },
        { status: 400 },
      );
    }

    const feedback = await Feedback.create({
      orderId,
      rating,
      comment: typeof comment === 'string' ? comment.trim() : '',
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (err: any) {
    console.error('Feedback Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to submit feedback' },
      { status: 500 },
    );
  }
}
