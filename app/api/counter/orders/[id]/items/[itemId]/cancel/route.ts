import { NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/db'
import OrderItem from '@/app/lib/models/orderItem'
import mongoose from 'mongoose'

import { requireRole } from '@/app/lib/auth/requireRole'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {

  try {

    /* ---------------- AUTH ---------------- */

    await requireRole(['counter','admin'])

    await connectDB()

    const { itemId } = await context.params

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item id' },
        { status: 400 }
      )
    }

    /* ---------------- FIND ITEM ---------------- */

    const item = await OrderItem.findById(itemId)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.cancelled) {
      return NextResponse.json(
        { error: 'Item already cancelled' },
        { status: 400 }
      )
    }

    /* ---------------- CANCEL LOGIC ---------------- */

    item.cancelled = true
    item.billable = false
    item.cancelStage = item.kitchenStatus
    item.cancelledAt = new Date()

    await item.save()

    return NextResponse.json({
      success: true,
      itemId
    })

  } catch (err: any) {

    console.error('Cancel Item Error:', err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )

  }

}