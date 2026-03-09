import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(['admin']);
  await connectDB();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await req.json();
  const item = await MenuItem.findById(id);

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // 🔁 STATUS ACTIONS
  if (body.action) {
    switch (body.action) {
      case 'activate':
        item.status = 'active';
        break;

      case 'disable':
        item.status = 'unavailable';
        break;

      case 'archive':
        item.status = 'archived';
        item.archivedAt = new Date();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await item.save();
    return NextResponse.json(item);
  }

  // ✏ Normal update
  const updated = await MenuItem.findByIdAndUpdate(id, body, { new: true });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await context.params;

  await MenuItem.findByIdAndDelete(id);

  return NextResponse.json({ deleted: true });
}
