export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';

import { connectDB } from '@/app/lib/db';
import BillingConfig from '@/app/lib/models/billingConfig';
import Bill from '@/app/lib/models/bill';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST(req: Request) {
  const session = await mongoose.startSession();

  try {
    await requireRole(['counter', 'admin']);
    await connectDB();

    const {
      orderId,
      discount = 0,
      adjustAmount = 0,
      customerPhone = '',
    } = await req.json();

    if (!orderId) {
      throw new Error('OrderId required');
    }

    const safeDiscount = Number(discount) || 0;
    const safeAdjustAmount = Number(adjustAmount) || 0;
    const safeCustomerPhone =
      typeof customerPhone === 'string' ? customerPhone.trim() : '';

    if (safeDiscount < 0) {
      throw new Error('Discount cannot be negative');
    }

    if (safeAdjustAmount < 0) {
      throw new Error('Adjust amount cannot be negative');
    }

    session.startTransaction();

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    const existing = await Bill.findOne({ orderId }).lean().session(session);

    if (existing) {
      await session.abortTransaction();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

      return NextResponse.json({
        ...existing,
        shareUrl: existing.shareToken
          ? `${appUrl}/bill/share/${existing.shareToken}`
          : null,
      });
    }

    if (!['running', 'billed'].includes(order.status)) {
      throw new Error('Order not eligible for billing');
    }

    const items = await OrderItem.find(
      {
        orderId,
        served: true,
        cancelled: false,
      },
      {
        priceSnapshot: 1,
        quantity: 1,
      },
    )
      .lean()
      .session(session);

    if (!items.length) {
      throw new Error('No served items');
    }

    const subtotal = items.reduce(
      (sum, i) => sum + i.priceSnapshot * i.quantity,
      0,
    );

    if (safeDiscount + safeAdjustAmount > subtotal) {
      throw new Error('Discount + adjust amount cannot exceed subtotal');
    }

    const config = await BillingConfig.findOne({}, { gstPercent: 1 }).lean();
    const gstPercent = config?.gstPercent ?? 0;

    const taxableAmount = Math.max(
      0,
      subtotal - safeDiscount - safeAdjustAmount,
    );
    const taxAmount = (taxableAmount * gstPercent) / 100;
    const totalAmount = taxableAmount + taxAmount;

    const last = await Bill.findOne({}, { billNumber: 1 })
      .sort({ billNumber: -1 })
      .lean()
      .session(session);

    const nextBillNumber = last?.billNumber ? last.billNumber + 1 : 1;
    const shareToken = crypto.randomBytes(16).toString('hex');

    const created = await Bill.create(
      [
        {
          billNumber: nextBillNumber,
          orderId,
          subtotal,
          tax: taxAmount,
          discount: safeDiscount,
          adjustAmount: safeAdjustAmount,
          totalAmount,
          customerPhone: safeCustomerPhone || undefined,
          shareToken,
        },
      ],
      { session },
    );

    await OrderItem.updateMany(
      {
        orderId,
        served: false,
        cancelled: false,
      },
      {
        $set: {
          cancelled: true,
          billable: false,
        },
      },
      { session },
    );

    order.status = 'billed';
    await order.save({ session });

    await session.commitTransaction();

    const bill = created[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    return NextResponse.json({
      ...bill.toObject(),
      shareUrl: `${appUrl}/bill/share/${bill.shareToken}`,
    });
  } catch (err: any) {
    await session.abortTransaction();

    console.error('Billing Error:', err);

    return NextResponse.json(
      { error: err.message || 'Failed to create bill' },
      { status: 500 },
    );
  } finally {
    await session.endSession();
  }
}
