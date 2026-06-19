/**
 * Server-side conversion relay (marketing-data stack, Phase 2 · gap D).
 *
 * The browser posts a conversion (with the SAME `eventId` it sent to the
 * `fbq`/`gtag` pixel so the platforms dedupe) and this route mirrors it to Meta
 * CAPI + GA4 Measurement Protocol with hashed identifiers. Survives pixel loss
 * (ad-blockers, ITP) and improves match quality.
 *
 * The foundation senders refuse to send without `marketing` consent; this route
 * additionally drops anything not explicitly `consented: true`. It is INERT until
 * the server keys are set (each platform is skipped if its env is missing) — a
 * dark sink, consent-safe, exactly like the pixels.
 *
 * Env (server-only; forwarded in next.config.ts env{} for WEB_COMPUTE):
 *   META_PIXEL_ID, FACEBOOK_CONVERSIONS_API_TOKEN, META_TEST_EVENT_CODE?,
 *   GA4_MEASUREMENT_ID, GA4_API_SECRET
 */
import { sendGa4Event, sendMetaConversion } from '@geniemarketing/foundation/server/conversions';

function accepted(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status: 202,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return accepted();
  }

  const consented = body.consented === true;
  const name = typeof body.name === 'string' ? body.name : '';
  if (!name || !consented) return accepted(); // no name or no consent → drop silently

  const event = {
    name,
    eventId: body.eventId as string | undefined,
    url: body.url as string | undefined,
    value: body.value as number | undefined,
    currency: body.currency as string | undefined,
    user: (body.user as Record<string, string>) ?? {},
    consented: true,
  };

  const tasks: Promise<unknown>[] = [];
  if (process.env.META_PIXEL_ID && process.env.FACEBOOK_CONVERSIONS_API_TOKEN) {
    tasks.push(
      sendMetaConversion(event, {
        pixelId: process.env.META_PIXEL_ID,
        accessToken: process.env.FACEBOOK_CONVERSIONS_API_TOKEN,
        testEventCode: process.env.META_TEST_EVENT_CODE,
      }),
    );
  }
  if (
    process.env.GA4_MEASUREMENT_ID &&
    process.env.GA4_API_SECRET &&
    typeof body.clientId === 'string'
  ) {
    tasks.push(
      sendGa4Event({ ...event, name: (body.ga4Name as string) ?? name }, body.clientId, {
        measurementId: process.env.GA4_MEASUREMENT_ID,
        apiSecret: process.env.GA4_API_SECRET,
      }),
    );
  }

  // Fire-and-forget; never block the browser on the ad platforms.
  await Promise.allSettled(tasks);
  return accepted();
}
