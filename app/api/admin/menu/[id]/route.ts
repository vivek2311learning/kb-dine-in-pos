
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { requireRole } from '@/app/lib/auth/requireRole';
import mongoose from 'mongoose';

export async function PATCH(
  req: Request,
  context: { params: { id: string } },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu item id' },
        { status: 400 },
      );
    }

    const body = await req.json();

    const update: any = {};

    /* STATUS ACTION */
    if (body.action) {
      switch (body.action) {
        case 'activate':
          update.status = 'active';
          update.archivedAt = null;
          break;

        case 'disable':
          update.status = 'unavailable';
          break;

        case 'archive':
          update.status = 'archived';
          update.archivedAt = new Date();
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 },
          );
      }
    }

    /* NORMAL UPDATE */
    if (body.name) update.name = body.name.trim();
    if (body.description) update.description = body.description.trim();
    if (body.price) update.price = Number(body.price);
    if (body.category) update.category = body.category;

    const item = await MenuItem.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).lean();

    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      item,
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
  context: { params: { id: string } },
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = context.params;

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