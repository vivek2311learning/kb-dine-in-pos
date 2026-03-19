export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET(
req:Request,
context:{params:Promise<{id:string}>}
){

try{

await requireRole(['counter','admin'])
await connectDB()

const {id} = await context.params

const table = await Table.findById(id).lean()

if(!table){

return NextResponse.json(
{error:'Table not found'},
{status:404}
)

}

return NextResponse.json(table)

}catch(err:any){

console.error('Table Fetch Error:',err)

return NextResponse.json(
{error:'Failed to fetch table'},
{status:500}
)

}

}