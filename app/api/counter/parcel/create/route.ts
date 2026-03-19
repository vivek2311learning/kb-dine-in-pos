export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Order from '@/app/lib/models/order';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function POST() {

try{

await requireRole(['counter','admin'])
await connectDB()

/* ---------- FIND LAST PARCEL ---------- */

const lastParcel = await Order.findOne({type:'parcel'})
.sort({parcelNumber:-1})
.lean()

const nextParcelNumber =
lastParcel?.parcelNumber
? lastParcel.parcelNumber + 1
: 1

/* ---------- CREATE ORDER ---------- */

const order = await Order.create({

type:'parcel',
parcelNumber:nextParcelNumber,
status:'running',
tableId:null

})

/* ---------- RESPONSE ---------- */

return NextResponse.json(order)

}catch(err:any){

console.error('Parcel Create Error:',err)

return NextResponse.json(
{error:'Failed to create parcel order'},
{status:500}
)

}

}