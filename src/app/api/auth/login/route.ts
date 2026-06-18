/**
 * POST /api/auth/login — proxy Medusa v2 customer login, set the session cookie.
 * Body: { email, password }. Returns { customer } and an httpOnly `tv_customer`
 * cookie holding the Medusa JWT (never exposed to page JS).
 */
import { AUTH_COOKIE, AUTH_MAX_AGE, AuthError, loginCustomer } from '@/lib/medusa-auth';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  try {
    const { customer, token } = await loginCustomer({ email, password });
    const res = NextResponse.json({ customer });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_MAX_AGE,
    });
    return res;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[auth/login] failed:', err);
    return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 });
  }
}
