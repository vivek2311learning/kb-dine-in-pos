import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import OrderItem from '@/app/lib/models/orderItem';
import Bill from '@/app/lib/models/bill';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(req: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get valid paid & non-refunded bill orderIds
    const billMatch: any = {
      isPaid: true,
      isRefunded: false,
    };

    if (from && to) {
      billMatch.printedAt = {
        $gte: new Date(from),
        $lte: new Date(to + 'T23:59:59.999Z'),
      };
    }

    const bills = await Bill.find(billMatch).select('orderId');
    const orderIds = bills.map((b) => b.orderId);

    // Aggregate items
    const items = await OrderItem.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          cancelled: false,
          served: true,
        },
      },
      {
        $group: {
          _id: '$nameSnapshot',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$priceSnapshot', '$quantity'] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
