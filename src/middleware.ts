import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes.
 * Checks for the presence of the admin_session cookie
 * on /dashboard and /api/admin routes.
 *
 * Note: Full token verification happens server-side in getSession().
 * This middleware provides an early redirect for unauthenticated users.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
