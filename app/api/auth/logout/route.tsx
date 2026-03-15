export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });

  /* Delete auth token */

  res.cookies.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });

  /* Delete role cookie */

  res.cookies.set('user_role', '', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });

  return res;
}
