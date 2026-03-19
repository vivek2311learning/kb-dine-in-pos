export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import BillingConfig from '@/app/lib/models/billingConfig';
import { requireRole } from '@/app/lib/auth/requireRole';

/* ================= GET ================= */

export async function GET() {
  await requireRole(['admin']);
  await connectDB();

  let config = await BillingConfig.findOne().lean();

  if (!config) {
    config = await BillingConfig.create({ gstPercent: 5 });
  }

  return NextResponse.json(config);
}

/* ================= PATCH ================= */

export async function PATCH(req: Request) {
  await requireRole(['admin']);
  await connectDB();

  const { gstPercent } = await req.json();

  /* 🔥 VALIDATION */
  if (typeof gstPercent !== 'number' || gstPercent < 0 || gstPercent > 100) {
    return NextResponse.json(
      { error: 'Invalid GST percent' },
      { status: 400 }
    );
  }

  /* 🔥 SINGLETON FIX */
  let config = await BillingConfig.findOne();

  if (!config) {
    config = await BillingConfig.create({ gstPercent });
  } else {
    config.gstPercent = gstPercent;
    await config.save();
  }

  return NextResponse.json({ success: true, config });
}