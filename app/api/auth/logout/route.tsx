export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // 🔥 IMPORTANT
  });

  res.cookies.set('user_role', '', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // 🔥 IMPORTANT
  });

  return res;
}