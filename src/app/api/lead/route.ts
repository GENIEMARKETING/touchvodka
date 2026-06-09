/**
 * POST /api/lead — the thin server-side proxy to the n8n lead pipeline (S8).
 *
 * Implements infrastructure/services/n8n/api-lead-contract.md §1 exactly:
 *   1. validateLeadPayload (shape check)            → 400 on bad shape
 *   2. honeypot non-empty                           → 200 (lie to the bot), drop
 *   3. Turnstile server-side verify                 → 400 on captcha fail
 *   4. attach server-derived fields (IP, UA, time)
 *   5. POST to n8n webhook with x-lead-secret
 *   6. return 202 (fire-and-forget) so the form never blocks on the pipeline
 *
 * All secrets (TURNSTILE_SECRET, LEAD_WEBHOOK_SECRET) stay server-side.
 */
import { validateLeadPayload } from '@vinny/foundation/lead-contract';
import { type NextRequest, NextResponse } from 'next/server';

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  // Local dev / pre-provision: no secret configured → skip (the block also omits
  // the widget in dev). In prod the secret is required (see env contract).
  if (!secret) return process.env.NODE_ENV !== 'production';
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['invalid json'] }, { status: 400 });
  }

  // 1. shape validation
  const result = validateLeadPayload(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }
  const payload = result.value;

  // 2. honeypot — lie to the bot, never forward
  if (payload.honeypot && payload.honeypot.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  // 3. Turnstile verify (server-side)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const captchaOk = await verifyTurnstile(payload.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ ok: false, errors: ['captcha'] }, { status: 400 });
  }

  // 4. server-derived enrichment (the browser must not set these)
  const enriched = {
    ...payload,
    meta: {
      ...payload.meta,
      clientIp: ip ?? 'unknown',
      userAgent: req.headers.get('user-agent') ?? 'unknown',
      receivedAt: new Date().toISOString(),
    },
  };

  // 5. forward to n8n
  const webhook = process.env.LEAD_WEBHOOK_URL;
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (webhook && secret) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-lead-secret': secret },
        body: JSON.stringify(enriched),
      });
    } catch (err) {
      // Don't fail the visitor's submit on a pipeline hiccup; log for retry.
      console.error('[lead] n8n forward failed:', err);
    }
  } else {
    // Pre-provision (S6/S8 not deployed): log so leads aren't silently lost.
    console.warn(
      '[lead] LEAD_WEBHOOK_URL not set — lead captured but not forwarded:',
      enriched.email,
    );
  }

  // 6. fire-and-forget
  return NextResponse.json({ ok: true }, { status: 202 });
}
