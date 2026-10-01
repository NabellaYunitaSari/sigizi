import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigizi-desa-sukomalo-secret-key-2026-research-prototype'
);

const COOKIE_NAME = 'sigizi_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Public paths
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api/auth/login')) {
    if (token && (pathname === '/login')) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;
        if (role === 'admin' || role === 'koordinator') {
          return NextResponse.redirect(new URL('/dashboard-desa', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Invalid token, allow access to login
      }
    }
    return NextResponse.next();
  }

  // Protected route check
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Role-restricted pages
    if (pathname.startsWith('/dashboard-desa') || pathname.startsWith('/kelola-user')) {
      if (role !== 'admin' && role !== 'koordinator') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard-desa/:path*',
    '/anak/:path*',
    '/ibu-hamil/:path*',
    '/laporan/:path*',
    '/kelola-user/:path*',
    '/login',
  ],
};
