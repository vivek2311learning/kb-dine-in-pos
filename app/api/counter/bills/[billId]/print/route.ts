export const dynamic = 'force-dynamic';

import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { billId } = await params;

    /* ✅ VALIDATE */
    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return new Response('Invalid bill id', { status: 400 });
    }

    /* ⚡ PARALLEL FETCH */
    const [bill, items] = await Promise.all([
      Bill.findById(billId).lean(),

      OrderItem.find({
        orderId: billId, // ❌ WRONG पहले → नीचे fix है
      }),
    ]);

    if (!bill) {
      return new Response('Bill not found', { status: 404 });
    }

    /* 🔥 CORRECT ITEMS QUERY */
    const orderItems = await OrderItem.find({
      orderId: bill.orderId,
      cancelled: false,
      $or: [{ served: true }, { kitchenStatus: 'ready' }],
    }).lean();

    /* ⚡ ONLY FIRST TIME WRITE */
    if (!bill.printedAt) {
      await Bill.updateOne(
        { _id: billId },
        { $set: { printedAt: new Date() } }
      );
    }

    /* ⚡ HTML BUILD (LIGHT) */
    const rows = orderItems
      .map(
        (i) => `
        <div class="row">
          <span>${i.nameSnapshot} x ${i.quantity}</span>
          <span>₹${i.priceSnapshot * i.quantity}</span>
        </div>
      `
      )
      .join('');

    const html = `
    <html>
      <head>
        <title>Bill #${bill.billNumber}</title>
        <style>
          body { font-family: Arial; padding: 16px; }
          h2 { text-align: center; }
          .row { display: flex; justify-content: space-between; font-size:14px; }
          hr { margin: 8px 0; }
        </style>
      </head>

      <body>
        <h2>Restaurant Bill</h2>

        <p>Bill No: ${bill.billNumber}</p>
        <p>Date: ${bill.printedAt || new Date().toLocaleString()}</p>

        <hr/>

        ${rows}

        <hr/>

        <div class="row">
          <strong>Total</strong>
          <strong>₹${bill.totalAmount}</strong>
        </div>

        <p style="text-align:center;margin-top:15px;">
          Thank you!
        </p>
      </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (err) {
    console.error('PRINT API ERROR:', err);
    return new Response('Print failed', { status: 500 });
  }
}