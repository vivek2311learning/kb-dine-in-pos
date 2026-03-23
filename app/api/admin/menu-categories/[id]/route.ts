import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/app/lib/db';
import MenuCategory from '@/app/lib/models/menuCategory';
import MenuItem from '@/app/lib/models/MenuItem';
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
        { error: 'Invalid category id' },
        { status: 400 },
      );
    }

    const body = await req.json();
    const action = String(body.action || '').trim();
    const name = String(body.name || '').trim();

    const category = await MenuCategory.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    if (action) {
      switch (action) {
        case 'activate':
          category.isActive = true;
          break;

        case 'disable':
          category.isActive = false;
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 },
          );
      }

      await category.save();

      return NextResponse.json({
        success: true,
        category,
      });
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 },
      );
    }

    const existing = await MenuCategory.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 },
      );
    }

    const oldName = category.name;

    category.name = name;
    await category.save();

    await MenuItem.updateMany(
      { category: oldName },
      { $set: { category: name } },
    );

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (err) {
    console.error('Menu Category Update Error:', err);

    return NextResponse.json(
      { error: 'Failed to update category' },
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
        { error: 'Invalid category id' },
        { status: 400 },
      );
    }

    const category = await MenuCategory.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }

    const linkedItems = await MenuItem.countDocuments({
      category: category.name,
    });

    if (linkedItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category because menu items are using it' },
        { status: 400 },
      );
    }

    await MenuCategory.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error('Menu Category Delete Error:', err);

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 },
    );
  }
}
