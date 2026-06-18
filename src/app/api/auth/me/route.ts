/**
 * GET /api/auth/me — the current customer for the session cookie, or null.
 * Used by the client CustomerProvider on mount + after auth actions. A
 * missing/expired token yields `{ customer: null }` (not an error).
 */
import { AUTH_COOKIE, getCustomer } from '@/lib/medusa-auth';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  try {
    const customer = await getCustomer(token);
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
