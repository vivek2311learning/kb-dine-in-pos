import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Payment from '@/app/lib/models/payment';
import Order from '@/app/lib/models/order';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const { billId, method, amount, receivedBy } = await req.json();

  const bill = await Bill.findById(billId);
  if (!bill) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  const order = await Order.findById(bill.orderId);
  if (!order || order.status !== 'billed') {
    return NextResponse.json(
      { error: 'Order not eligible for payment' },
      { status: 400 },
    );
  }

  if (amount !== bill.totalAmount) {
    return NextResponse.json(
      { error: 'Payment amount mismatch' },
      { status: 400 },
    );
  }

  const existingPayment = await Payment.findOne({ billId });
  if (existingPayment) {
    return NextResponse.json(
      { error: 'Payment already completed' },
      { status: 400 },
    );
  }

  const payment = await Payment.create({
    billId,
    method,
    amount,
    receivedBy,
  });

  order.status = 'paid';
  await order.save();

  return NextResponse.json(payment);
}
