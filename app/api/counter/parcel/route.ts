export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/db'
import Order from '@/app/lib/models/order'
import { requireRole } from '@/app/lib/auth/requireRole'

export async function GET() {

  try {

    await requireRole(['counter','admin'])

    await connectDB()

    const parcels = await Order.find({
      type:'parcel',
      status:'running'
    })
    .sort({ parcelNumber:1 })
    .select('_id parcelNumber status')
    .lean()

    return NextResponse.json(parcels)

  } catch(err:any){

    console.error('Parcel Fetch Error:',err)

    return NextResponse.json(
      {error:'Failed to fetch parcels'},
      {status:500}
    )

  }

}