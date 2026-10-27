import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAMES = ['candy_session', '__Host-candy_session'];

const PUBLIC_PATHS = ['/unlock', '/api/auth/login', '/api/auth/verify', '/api/auth/logout'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // UX gate: redirect to unlock if no session cookie exists.
  // Real security verification (HMAC signature + expiry) happens
  // server-side in every /api/* route using Node.js crypto.
  const hasCookie = COOKIE_NAMES.some((name) => {
    const val = req.cookies.get(name)?.value;
    return val && val.length > 10;
  });

  if (hasCookie) {
    return NextResponse.next();
  }

  if (req.headers.get('accept')?.includes('text/html')) {
    const unlockUrl = new URL('/unlock', req.url);
    unlockUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(unlockUrl);
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
