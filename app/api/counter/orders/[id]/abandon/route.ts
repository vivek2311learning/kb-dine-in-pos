import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import Bill from '@/app/lib/models/bill';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { id } = await context.params; // ✅ IMPORTANT

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'running') {
      return NextResponse.json(
        { error: 'Only running orders can be abandoned' },
        { status: 400 },
      );
    }

    // ❗ Prevent abandon if bill already exists
    const existingBill = await Bill.findOne({ orderId: id });
    if (existingBill) {
      return NextResponse.json(
        { error: 'Cannot abandon after bill generated' },
        { status: 400 },
      );
    }

    // ❗ Check if any confirmed item exists
    const confirmedItems = await OrderItem.find({
      orderId: id,
      kitchenStatus: { $ne: 'draft' },
      cancelled: false,
    });

    if (confirmedItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot abandon. Items already confirmed.' },
        { status: 400 },
      );
    }

    // ✅ Delete draft items
    await OrderItem.deleteMany({ orderId: id });

    // ✅ Close order
    order.status = 'closed';
    order.closedAt = new Date();
    await order.save();

    // ✅ Free table
    await Table.findByIdAndUpdate(order.tableId, {
      status: 'free',
      currentOrderId: null,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Abandon Order Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
