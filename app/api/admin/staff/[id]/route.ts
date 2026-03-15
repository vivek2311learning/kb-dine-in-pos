export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import mongoose from 'mongoose';
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
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    const body = await req.json();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    /* 🔄 Activate / Deactivate */
    if (typeof body.isActive === 'boolean') {
      user.isActive = body.isActive;
      await user.save();

      return NextResponse.json({
        message: body.isActive ? 'Staff activated' : 'Staff deactivated',
      });
    }

    /* ✏️ Normal Update */

    if (body.name) user.name = body.name.trim();

    if (body.email) user.email = body.email.toLowerCase().trim();

    if (body.role) user.role = body.role;

    // 🔐 Password update (NO manual hashing)
    if (body.password && body.password.length >= 6) {
      user.password = body.password; // 👈 plain
    }

    await user.save(); // model will hash automatically

    return NextResponse.json({
      message: 'Staff updated successfully',
    });
  } catch (err: any) {
    console.error('Staff Update Error:', err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
