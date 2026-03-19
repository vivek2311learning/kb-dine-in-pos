export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { signToken } from '@/app/lib/auth/token';

export async function POST(req: Request) {
  try {
    console.time('TOTAL_LOGIN');

    const body = await req.json();

    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    /* ✅ BASIC VALIDATION */

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    /* ================= DB CONNECT ================= */

    console.time('DB_CONNECT');
    await connectDB();
    console.timeEnd('DB_CONNECT');

    /* ================= FIND USER ================= */

    console.time('FIND_USER');

    const user = await User.findOne({
      email,
      isActive: true,
    })
      .select('_id password role') // ⚡ minimal data
      .lean();

    console.timeEnd('FIND_USER');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    /* ================= PASSWORD CHECK ================= */

    console.time('PASSWORD_COMPARE');

    const ok = await bcrypt.compare(password, user.password);

    console.timeEnd('PASSWORD_COMPARE');

    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    /* ================= TOKEN ================= */

    console.time('TOKEN');

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    console.timeEnd('TOKEN');

    /* ================= RESPONSE ================= */

    const res = NextResponse.json({
      success: true,
      role: user.role,
    });

    /* ================= COOKIES ================= */

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    };

    res.cookies.set('auth_token', token, cookieOptions);

    res.cookies.set('user_role', user.role, {
      ...cookieOptions,
      httpOnly: false, // UI needs access
    });

    console.timeEnd('TOTAL_LOGIN');

    return res;
  } catch (err) {
    console.error('Login Error:', err);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 },
    );
  }
}