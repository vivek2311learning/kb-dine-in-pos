export const dynamic = 'force-dynamic';

import { connectDB } from '@/app/lib/db';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ billId: string }> },
) {
  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const { billId } = await params;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return new Response('Invalid bill id', { status: 400 });
    }

    const bill = await Bill.findById(billId).lean();

    if (!bill) {
      return new Response('Bill not found', { status: 404 });
    }

    const [order, orderItems] = await Promise.all([
      Order.findById(bill.orderId)
        .select('type tableId parcelNumber createdAt')
        .lean(),

      OrderItem.find({
        orderId: bill.orderId,
        cancelled: false,
        served: true,
      })
        .select('nameSnapshot priceSnapshot quantity')
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    let tableNumber: number | null = null;

    if (order?.type === 'dine-in' && order.tableId) {
      const table = await Table.findById(order.tableId)
        .select('tableNumber')
        .lean();

      tableNumber = table?.tableNumber || null;
    }

    if (!bill.printedAt) {
      await Bill.updateOne(
        { _id: billId },
        { $set: { printedAt: new Date() } },
      );
    }

    const printedAt = bill.printedAt || new Date();

    const rows = orderItems
      .map(
        (i) => `
          <div class="row item-row">
            <span>${i.nameSnapshot} × ${i.quantity}</span>
            <span>₹${i.priceSnapshot * i.quantity}</span>
          </div>
        `,
      )
      .join('');

    const orderLabel =
      order?.type === 'parcel'
        ? `Parcel #${order?.parcelNumber || '-'}`
        : `Table ${tableNumber || '-'}`;

    const html = `
      <html>
        <head>
          <title>Bill #${bill.billNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 16px;
              max-width: 380px;
              margin: 0 auto;
              color: #111;
            }
            h2 {
              text-align: center;
              margin: 0 0 10px 0;
              font-size: 22px;
            }
            .muted {
              color: #555;
              font-size: 13px;
            }
            .center {
              text-align: center;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 12px;
              font-size: 14px;
              margin: 6px 0;
            }
            .item-row {
              border-bottom: 1px dashed #ddd;
              padding-bottom: 6px;
            }
            hr {
              border: none;
              border-top: 1px dashed #999;
              margin: 12px 0;
            }
            .strong {
              font-weight: 700;
            }
            .total {
              font-size: 16px;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <h2>Restaurant Bill</h2>

          <div class="center muted">Bill #${bill.billNumber}</div>
          <div class="center muted">${orderLabel}</div>
          <div class="center muted">${new Date(printedAt).toLocaleString()}</div>

          <hr />

          ${rows}

          <hr />

          <div class="row">
            <span>Subtotal</span>
            <span>₹${bill.subtotal || 0}</span>
          </div>

          <div class="row">
            <span>Discount</span>
            <span>- ₹${bill.discount || 0}</span>
          </div>

          <div class="row">
            <span>Adjust Amount</span>
            <span>- ₹${bill.adjustAmount || 0}</span>
          </div>

          <div class="row">
            <span>Tax</span>
            <span>₹${bill.tax || 0}</span>
          </div>

          <hr />

          <div class="row total">
            <span>Total</span>
            <span>₹${bill.totalAmount || 0}</span>
          </div>

          <div class="row">
            <span>Status</span>
            <span>${bill.isPaid ? 'Paid' : 'Unpaid'}</span>
          </div>

          <p class="center" style="margin-top:16px;">Thank you!</p>
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
