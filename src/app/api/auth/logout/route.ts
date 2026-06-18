/**
 * POST /api/auth/logout — drop the session cookie. Medusa JWTs are stateless, so
 * there is nothing to revoke server-side; clearing the httpOnly cookie ends the
 * session for this browser.
 */
import { AUTH_COOKIE } from '@/lib/medusa-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
