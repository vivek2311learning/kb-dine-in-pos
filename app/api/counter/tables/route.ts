import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Table from '@/app/lib/models/Table';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function GET() {
  await requireRole(['counter', 'admin']);
  await connectDB();

  const tables = await Table.find().sort({ tableNumber: 1 });

  return NextResponse.json(tables);
}
