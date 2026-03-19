export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import mongoose from 'mongoose';
import { requireRole } from '@/app/lib/auth/requireRole';

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
        { error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    /* ⚡ DIRECT UPDATE OBJECT */
    const update: any = {};

    if (typeof body.isActive === 'boolean') {
      update.isActive = body.isActive;
    }

    if (body.name) update.name = body.name.trim();
    if (body.email) update.email = body.email.toLowerCase().trim();
    if (body.role) update.role = body.role;

    if (body.password && body.password.length >= 6) {
      update.password = body.password; // model handles hashing
    }

    const user = await User.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Staff updated successfully',
      user,
    });

  } catch (err: any) {
    console.error('Staff Update Error:', err);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}