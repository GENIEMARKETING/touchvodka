/**
 * POST /api/auth/register — create a Medusa v2 customer, then log in.
 * Body: { name?, email, password }. Returns { customer } and the httpOnly
 * `tv_customer` session cookie. Honest 409 if the email already has an account.
 */
import { AUTH_COOKIE, AUTH_MAX_AGE, AuthError, registerCustomer } from '@/lib/medusa-auth';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  const name = String(body.name ?? '').trim();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  try {
    const { customer, token } = await registerCustomer({ name, email, password });
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
    console.error('[auth/register] failed:', err);
    return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 });
  }
}
