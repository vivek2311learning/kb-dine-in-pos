import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const body = await req.json();
    console.log('BODY:', body);

    const orderId = body.orderId;
    console.log('ORDER ID:', orderId);

    if (!orderId) {
      throw new Error('OrderId missing');
    }

    const order = await Order.findById(orderId);
    console.log('ORDER FOUND:', order);

    if (!order) {
      throw new Error('Order not found');
    }

    const items = await OrderItem.find({
      orderId,
      kitchenStatus: { $ne: 'draft' },
    });

    console.log('ITEMS:', items);

    if (!items.length) {
      throw new Error('No confirmed items');
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    const lastBill = await Bill.findOne().sort({ billNumber: -1 });
    const nextBillNumber = lastBill ? lastBill.billNumber + 1 : 1;

    const bill = await Bill.create({
      billNumber: nextBillNumber,
      orderId,
      subtotal,
      tax: 0,
      discount: 0,
      totalAmount: subtotal,
    });

    return NextResponse.json(bill);
  } catch (err: any) {
    console.error('🔥 BILL ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
