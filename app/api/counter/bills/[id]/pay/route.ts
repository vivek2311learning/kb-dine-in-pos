export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import Payment from '@/app/lib/models/payment';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

import { requireRole } from '@/app/lib/auth/requireRole';
import { verifyToken } from '@/app/lib/auth/token';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    // ✅ Unwrap params (Next 16)
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill id' }, { status: 400 });
    }

    // 🔐 Read user from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'User not logged in' },
        { status: 401 },
      );
    }

    const payload: any = await verifyToken(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const receivedBy = payload.userId;

    const { payments } = await req.json();

    const bill = await Bill.findById(id);

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (bill.isPaid) {
      return NextResponse.json({ error: 'Bill already paid' }, { status: 400 });
    }

    const order = await Order.findById(bill.orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const totalPaid = payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );

    if (totalPaid !== bill.totalAmount) {
      return NextResponse.json(
        { error: 'Payment total mismatch' },
        { status: 400 },
      );
    }

    // 💰 Create payment entries
    for (const p of payments) {
      await Payment.create({
        billId: bill._id,
        method: p.method,
        amount: p.amount,
        receivedBy,
      });
    }

    // ✅ Update order status
    order.status = 'paid';
    await order.save();

    // ✅ Update bill status
    bill.isPaid = true;
    bill.paidAt = new Date();
    await bill.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Payment Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
