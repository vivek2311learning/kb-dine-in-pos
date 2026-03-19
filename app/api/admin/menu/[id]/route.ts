
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { requireRole } from '@/app/lib/auth/requireRole';
import mongoose from 'mongoose';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu item id' },
        { status: 400 },
      );
    }

    const body = await req.json();

    const item = await MenuItem.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    /* STATUS ACTIONS */

    if (body.action) {
      switch (body.action) {
        case 'activate':
          item.status = 'active';
          item.archivedAt = undefined;
          break;

        case 'disable':
          item.status = 'unavailable';
          break;

        case 'archive':
          item.status = 'archived';
          item.archivedAt = new Date();
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 },
          );
      }

      await item.save();

      return NextResponse.json({
        success: true,
        item,
      });
    }

    /* NORMAL UPDATE */

    const updated = await MenuItem.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      item: updated,
    });
  } catch (err) {
    console.error('Menu Update Error:', err);

    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu item id' },
        { status: 400 },
      );
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      {
        status: 'archived',
        archivedAt: new Date(),
      },
      { new: true }
    );

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error('Menu Delete Error:', err);

    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 },
    );
  }
}