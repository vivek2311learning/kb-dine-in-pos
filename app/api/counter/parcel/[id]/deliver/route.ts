export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/db'
import Order from '@/app/lib/models/order'

export async function PATCH(
req:Request,
context: { params: Promise<{ id: string }> }
) {


await connectDB()

const {id}=await context.params

await Order.findByIdAndUpdate(id,{
parcelDelivered:true,
status:'closed',
closedReason:'completed',
closedAt:new Date()
})

return NextResponse.json({success:true})

}