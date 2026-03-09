import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;
    const { reason } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
    }

    // 🔐 Get user from token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const bill = await Bill.findById(id);

    if (!bill || !bill.isPaid) {
      return NextResponse.json({ error: 'Invalid refund' }, { status: 400 });
    }

    if (bill.isRefunded) {
      return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
    }

    // ✅ Mark refunded
    bill.isRefunded = true;
    bill.refundAt = new Date();
    bill.refundReason = reason;
    bill.refundAmount = bill.totalAmount;
    bill.refundedBy = payload.userId;

    await bill.save();

    // ✅ Update order status
    const order = await Order.findById(bill.orderId);
    if (order) {
      order.status = 'refunded';
      await order.save();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Refund Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
