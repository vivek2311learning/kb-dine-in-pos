import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import OrderItem from '@/app/lib/models/orderItem';
import Table from '@/app/lib/models/Table';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {

  try {

    await requireRole(['counter','admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order id' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    /* ---------------- FIND ITEMS ---------------- */

    const items = await OrderItem.find({
      orderId: id,
      cancelled: false
    });

    /* ---------------- SERVED CHECK ---------------- */

    const servedItems = items.filter(i => i.served);

    if (servedItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot close order. Items already served.' },
        { status: 400 }
      );
    }

    /* ---------------- HANDLE ITEMS ---------------- */

    for (const item of items) {

      // READY BUT NOT SERVED → WASTAGE
      if (item.kitchenStatus === 'ready' && !item.served) {

        item.wasted = true;
        item.billable = false;

      }

      // NOT READY → CANCEL
      else {

        item.cancelled = true;
        item.billable = false;

      }

      await item.save();

    }

    /* ---------------- CLOSE ORDER ---------------- */

    order.status = 'closed';
    order.closedAt = new Date();

    await order.save();

    /* ---------------- FREE TABLE ---------------- */

    await Table.findByIdAndUpdate(order.tableId,{
      status:'free',
      currentOrderId:null
    });

    return NextResponse.json({
      success:true,
      message:'Table freed successfully'
    });

  } catch(err:any){

    console.error('Force Close Error:',err);

    return NextResponse.json(
      { error:err.message },
      { status:500 }
    );

  }

}