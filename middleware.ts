import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/pembelian',
  '/pembelian/tambah',
  '/master',
  '/pengaturan',
  '/pengguna',
  '/rekap',
];

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

async function signPayload(value: string, secret: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function getSessionRole(value?: string) {
  if (!value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = await signPayload(payload, process.env.AUTH_SECRET || 'dev-secret');
  if (signature !== expected) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const session = JSON.parse(decoded);
    return typeof session.role === 'string' ? session.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  const role = await getSessionRole(session);

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!['Super Admin', 'Admin', 'Operator'].includes(role)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/pembelian')) {
    if (role === 'Operator' && pathname !== '/pembelian/tambah') {
      return NextResponse.redirect(new URL('/pembelian/tambah', request.url));
    }
    if (role !== 'Operator') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/pengguna') && role !== 'Super Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pembelian/:path*', '/master/:path*', '/pengaturan', '/pengguna', '/rekap/:path*'],
};
