import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import MenuCategory from '@/app/lib/models/menuCategory';
import { requireRole } from '@/app/lib/auth/requireRole';

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

    if (body.action) {
      if (body.action === 'activate') {
        item.status = 'active';
      } else if (body.action === 'disable') {
        item.status = 'unavailable';
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      await item.save();

      return NextResponse.json({
        success: true,
        item,
      });
    }

    const updateData: Record<string, any> = {};

    if (typeof body.name === 'string') {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          { error: 'Name is required' },
          { status: 400 },
        );
      }

      updateData.name = name;
    }

    if (typeof body.description === 'string') {
      const description = body.description.trim();

      if (!description) {
        return NextResponse.json(
          { error: 'Description is required' },
          { status: 400 },
        );
      }

      updateData.description = description;
    }

    if (typeof body.category === 'string') {
      const category = body.category.trim();

      if (!category) {
        return NextResponse.json(
          { error: 'Category is required' },
          { status: 400 },
        );
      }

      const categoryDoc = await MenuCategory.findOne({
        name: category,
        isActive: true,
      }).lean();

      if (!categoryDoc) {
        return NextResponse.json(
          { error: 'Selected category is invalid or disabled' },
          { status: 400 },
        );
      }

      updateData.category = category;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: 'Valid price is required' },
          { status: 400 },
        );
      }

      updateData.price = price;
    }

    const updated = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
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

    const deleted = await MenuItem.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
