export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');

    const query: any = {};

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('tableId', 'tableNumber')
      .sort({ closedAt: -1 });

    const bills = await Bill.find({
      orderId: { $in: orders.map((o) => o._id) },
    });

    const result = orders.map((order) => {
      const bill = bills.find(
        (b) => b.orderId.toString() === order._id.toString(),
      );

      return {
        _id: order._id,

        status: order.status,

        table: order.tableId,

        openedAt: order.createdAt,
        closedAt: order.closedAt,

        billNumber: bill?.billNumber || null,

        totalAmount: bill?.totalAmount || 0,

        isPaid: bill?.isPaid || false,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
