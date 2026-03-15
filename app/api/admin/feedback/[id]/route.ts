export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Feedback from '@/app/lib/models/Feedback';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['admin']);

  await connectDB();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid feedback id' }, { status: 400 });
  }

  const feedback = await Feedback.findById(id)
    .populate({
      path: 'orderId',
      populate: { path: 'tableId' },
    })
    .lean();

  if (!feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }

  /* ---------- BILL ---------- */

  const bill = await Bill.findOne({
    orderId: feedback.orderId?._id,
  }).lean();

  return NextResponse.json({
    ...feedback,

    billNumber: bill?.billNumber || null,

    billAmount: bill?.totalAmount || null,
  });
}
