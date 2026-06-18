/**
 * Medusa v2 customer auth — server-only helpers.
 *
 * The published `@geniemarketing/commerce` client has NO customer-auth surface
 * (only catalog + cart + checkout), so — exactly like lib/checkout.ts adds the
 * missing address/shipping ops — this adds register / login / session against the
 * Medusa v2 `/auth/*` + `/store/customers*` endpoints.
 *
 * WHY SERVER-SIDE (not a browser SDK): the Medusa JWT is kept in an httpOnly
 * cookie set by our /api/auth/* routes, so it is never exposed to page JS (XSS-
 * safe) AND we sidestep Medusa's AUTH_CORS allowlist entirely — the WEB_COMPUTE
 * server calls shop-api directly (server-to-server, no browser preflight). The
 * cart stays a browser flow (STORE_CORS allowlists the site origin); auth does
 * not need that.
 *
 * Scoped to this brand's sales channel purely by the publishable key, same as the
 * rest of the commerce seam — there is no cross-tenant surface here.
 */
import 'server-only';

// Read NEXT_PUBLIC_* STATICALLY so Next inlines them into the server bundle at
// build (a bare dynamic `process.env[key]` isn't exposed on the Amplify
// WEB_COMPUTE runtime — registry `medusa-client-needs-explicit-config-on-amplify`).
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

/** httpOnly cookie holding the Medusa customer session JWT. */
export const AUTH_COOKIE = 'tv_customer';
/** ~1 day — matches the Medusa emailpass JWT `exp`. */
export const AUTH_MAX_AGE = 60 * 60 * 24;

export type Customer = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

/** Is Medusa customer auth wired for this brand? (URL + publishable key present.) */
export function authConfigured(): boolean {
  return Boolean(MEDUSA_URL && PUBLISHABLE_KEY);
}

/** A user-facing auth failure — `message` is safe to show; `status` maps to HTTP. */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

async function medusaFetch(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  if (!MEDUSA_URL) throw new AuthError('Accounts are not available right now.', 503);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (PUBLISHABLE_KEY) headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  const res = await fetch(new URL(path, MEDUSA_URL), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* non-JSON error body — leave json empty */
  }
  return { ok: res.ok, status: res.status, json };
}

/** Exchange email+password for a Medusa emailpass JWT. Throws on bad credentials. */
async function loginToken(email: string, password: string): Promise<string> {
  const { ok, json } = await medusaFetch('/auth/customer/emailpass', {
    method: 'POST',
    body: { email, password },
  });
  if (!ok || typeof json.token !== 'string') {
    throw new AuthError('Invalid email or password.', 401);
  }
  return json.token;
}

/** The signed-in customer for a session token, or null if the token is invalid/expired. */
export async function getCustomer(token: string | undefined): Promise<Customer | null> {
  if (!token) return null;
  const { ok, json } = await medusaFetch('/store/customers/me', { token });
  if (!ok) return null;
  return (json.customer as Customer | undefined) ?? null;
}

/** Register a new customer, then log in. Returns the customer + a session token. */
export async function registerCustomer(input: {
  name?: string;
  email: string;
  password: string;
}): Promise<{ customer: Customer; token: string }> {
  // 1. Create the auth identity (returns a registration token with empty actor_id).
  const reg = await medusaFetch('/auth/customer/emailpass/register', {
    method: 'POST',
    body: { email: input.email, password: input.password },
  });
  if (!reg.ok || typeof reg.json.token !== 'string') {
    const msg = String(reg.json.message ?? '').toLowerCase();
    if (reg.status === 401 || msg.includes('exists')) {
      throw new AuthError('An account with this email already exists. Please sign in.', 409);
    }
    throw new AuthError('Could not create your account. Please try again.', reg.status || 400);
  }

  // 2. Create the customer record, linked to that identity via the reg token.
  const [first, ...rest] = (input.name ?? '').trim().split(/\s+/).filter(Boolean);
  const create = await medusaFetch('/store/customers', {
    method: 'POST',
    token: reg.json.token,
    body: {
      email: input.email,
      first_name: first ?? null,
      last_name: rest.length ? rest.join(' ') : null,
    },
  });
  if (!create.ok || !create.json.customer) {
    const msg = String(create.json.message ?? '').toLowerCase();
    if (msg.includes('exists')) {
      throw new AuthError('An account with this email already exists. Please sign in.', 409);
    }
    throw new AuthError('Could not create your account. Please try again.', create.status || 400);
  }

  // 3. Re-login for a session JWT (the reg token's actor_id is empty pre-customer).
  const token = await loginToken(input.email, input.password);
  return { customer: create.json.customer as Customer, token };
}

/** Log an existing customer in. Returns the customer + a session token. */
export async function loginCustomer(input: {
  email: string;
  password: string;
}): Promise<{ customer: Customer; token: string }> {
  const token = await loginToken(input.email, input.password);
  const customer = await getCustomer(token);
  if (!customer) throw new AuthError('Invalid email or password.', 401);
  return { customer, token };
}
