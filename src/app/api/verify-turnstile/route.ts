import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/verify-turnstile — standalone Cloudflare Turnstile check.
 *
 * T48 customer login/signup call the shared Medusa `/auth/*` endpoints directly
 * from the browser (no Next route in between), so there's nowhere server-side to
 * verify a captcha during auth. This tiny route closes that gap: the AuthScreen
 * obtains a Turnstile token, posts it here FIRST, and only proceeds to
 * `useAuth.login()/register()` when `{ ok: true }` — blunting bot signups and
 * credential-stuffing. The secret never leaves the server.
 *
 * Same graceful contract as `/api/lead`'s verifyTurnstile: with no
 * `TURNSTILE_SECRET` configured it passes outside production (local dev / before
 * the key is provisioned) and fails closed in production.
 */
async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let token = '';
  try {
    const body = (await req.json()) as { token?: unknown };
    if (typeof body.token === 'string') token = body.token;
  } catch {
    // fall through → empty token → fails (in prod)
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const ok = await verifyTurnstile(token, ip);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
