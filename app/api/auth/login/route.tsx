import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { signToken } from '@/app/lib/auth/token';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await connectDB();

    /* ================= FIND USER ================= */

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    /* ================= PASSWORD CHECK ================= */

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    /* ================= TOKEN GENERATE ================= */

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      role: user.role,
    });

    /* ================= AUTH TOKEN ================= */

    res.cookies.set('auth_token', token, {
      httpOnly: true, // JS access nahi kar sakta (security)
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    /* ================= UI ROLE COOKIE ================= */
    /* Navbar aur frontend role detect karega */

    res.cookies.set('user_role', user.role, {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
