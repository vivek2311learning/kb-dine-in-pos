export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Feedback from '@/app/lib/models/Feedback';
import Order from '@/app/lib/models/order';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const rating = searchParams.get('rating');

  const filter: any = {};

  if (rating) {
    filter.rating = Number(rating);
  }

  const feedbacks = await Feedback.find(filter)
    .populate({
      path: 'orderId',
      populate: { path: 'tableId' },
    })
    .sort({ createdAt: -1 });

  return NextResponse.json(feedbacks);
}
