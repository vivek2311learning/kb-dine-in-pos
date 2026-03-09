import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth/token';

/*
Public routes
*/
const PUBLIC_ROUTES = ['/', '/menu', '/about', '/contact', '/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /*
  Skip static files
  */
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;

  /*
  Logged-in user should never see login page
  */
  if (pathname === '/login' && token) {
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login?expired=1', req.url));
    }

    if (payload.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    if (payload.role === 'counter') {
      return NextResponse.redirect(new URL('/counter/tables', req.url));
    }

    if (payload.role === 'kitchen') {
      return NextResponse.redirect(new URL('/kitchen/orders', req.url));
    }
  }

  /*
  Public routes allow
  IMPORTANT: "/" exact match hona chahiye
  */
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname === '/login';

  if (isPublic) {
    return NextResponse.next();
  }

  /*
  Not logged in → redirect login
  */
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/login?expired=1', req.url));
  }

  const role = payload.role;

  /*
  Admin protection
  */
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  /*
  Counter protection
  */
  if (
    pathname.startsWith('/counter') &&
    role !== 'counter' &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  /*
  Kitchen protection
  */
  if (
    pathname.startsWith('/kitchen') &&
    role !== 'kitchen' &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
