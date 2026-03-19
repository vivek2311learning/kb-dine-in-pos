export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/app/lib/db'
import OrderItem from '@/app/lib/models/orderItem'
import { requireRole } from '@/app/lib/auth/requireRole'

export async function GET(){

try{

await requireRole(['counter','admin'])

await connectDB()

const readyOrders = await OrderItem.aggregate([
{
$match:{
kitchenStatus:'ready',
served:false,
cancelled:false
}
},
{
$group:{
_id:'$orderId'
}
}
])

return NextResponse.json(readyOrders)

}catch(err){

console.error(err)

return NextResponse.json({error:'failed'},{status:500})

}

}