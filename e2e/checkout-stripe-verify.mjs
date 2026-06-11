/**
 * S10 — Node-level STRIPE checkout verification (no browser, no CORS, deterministic).
 *
 * Proves a real Stripe-TEST payment end-to-end against the LIVE shared Medusa:
 *   cart → line item → address → shipping → Stripe payment session (real
 *   PaymentIntent) → confirm the PI via the Stripe API with `pm_card_visa`
 *   (= the 4242 test card) → completeCart → an order carrying `pi_…test`.
 *
 * This is the deterministic counterpart to the browser e2e (checkout-live.spec.ts),
 * which renders the Stripe Payment Element correctly but is flaky to drive through
 * Stripe's nested iframes headless. Here we confirm the PaymentIntent directly so
 * the proof is reliable: PI transitions to succeeded/requires_capture and the cart
 * completes to a Medusa order.
 *
 *   STRIPE_API_KEY=sk_test_… node e2e/checkout-stripe-verify.mjs
 *   (read the key from SOPS at call time — never commit it)
 */
const MEDUSA = 'https://shop-api.fatdogspirits.com';
const PUBKEY = 'pk_5e0ff365944b83fd4cbd2b10483f626f67d89aa9bb3f333b5cced124d58d52eb';
const REGION = 'reg_01KTQK4KQZVYM4NBG80J28J4CV';
const STRIPE_PROVIDER = 'pp_stripe_stripe';
const SK = process.env.STRIPE_API_KEY;
if (!SK || !SK.startsWith('sk_test_')) {
  console.error('❌ set STRIPE_API_KEY=sk_test_… (from SOPS); refusing to run without a TEST key');
  process.exit(1);
}

const ADDR = {
  first_name: 'Test', last_name: 'Buyer', address_1: '123 Congress Ave',
  city: 'Austin', province: 'TX', postal_code: '78701', country_code: 'us', phone: '5125550100',
};

async function store(path, opts = {}) {
  const url = new URL(`/store/${path}`, MEDUSA);
  for (const [k, v] of Object.entries(opts.params ?? {})) url.searchParams.set(k, v);
  const headers = { 'x-publishable-api-key': PUBKEY };
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(url, {
    method: opts.method ?? 'GET', headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined, cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Medusa ${res.status} ${opts.method ?? 'GET'} /store/${path}: ${await res.text()}`);
  return res.json();
}

async function stripeApi(path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SK}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status} ${path}: ${JSON.stringify(j.error ?? j)}`);
  return j;
}

const step = (n, msg) => console.log(`  ${n}. ${msg}`);

(async () => {
  console.log('S10 STRIPE checkout (4242) → live shop-api + live Stripe TEST\n');

  step(1, 'list a product variant');
  const { products } = await store('products', { params: { region_id: REGION, limit: '1' } });
  const variantId = products[0].variants[0].id;
  console.log(`     → ${products[0].title} variant ${variantId}`);

  step(2, 'create cart');
  const { cart } = await store('carts', { method: 'POST', body: { region_id: REGION } });
  console.log(`     → ${cart.id} ${cart.currency_code}`);

  step(3, 'add line item');
  await store(`carts/${cart.id}/line-items`, { method: 'POST', body: { variant_id: variantId, quantity: 1 } });

  step(4, 'set email + addresses');
  await store(`carts/${cart.id}`, { method: 'POST', body: { email: 's10-stripe-verify@touchvodka.test', shipping_address: ADDR, billing_address: ADDR } });

  step(5, 'add shipping method');
  const { shipping_options } = await store('shipping-options', { params: { cart_id: cart.id } });
  if (!shipping_options?.length) throw new Error('no shipping options');
  await store(`carts/${cart.id}/shipping-methods`, { method: 'POST', body: { option_id: shipping_options[0].id } });
  console.log(`     → ${shipping_options[0].name} $${shipping_options[0].amount}`);

  step(6, 'create payment collection + Stripe payment session');
  const { payment_collection: pc } = await store('payment-collections', { method: 'POST', body: { cart_id: cart.id } });
  const pcWith = await store(`payment-collections/${pc.id}/payment-sessions`, { method: 'POST', body: { provider_id: STRIPE_PROVIDER } });
  const session = (pcWith.payment_collection ?? pcWith).payment_sessions?.find((s) => s.provider_id === STRIPE_PROVIDER);
  const clientSecret = session?.data?.client_secret;
  if (!clientSecret) throw new Error(`no Stripe client_secret in session: ${JSON.stringify(session?.data ?? session)}`);
  const piId = String(clientSecret).split('_secret_')[0];
  console.log(`     → PaymentIntent ${piId}`);

  step(7, 'confirm the PaymentIntent via Stripe API with pm_card_visa (4242)');
  const confirmed = await stripeApi(`payment_intents/${piId}/confirm`, {
    payment_method: 'pm_card_visa',
    return_url: 'https://touchvodka.com/checkout',
  });
  console.log(`     → ${confirmed.id} status=${confirmed.status}`);
  if (!['succeeded', 'requires_capture'].includes(confirmed.status)) {
    throw new Error(`PI not authorized (status=${confirmed.status})`);
  }

  step(8, 'completeCart → order');
  const done = await store(`carts/${cart.id}/complete`, { method: 'POST', body: {} });
  const order = done.order ?? done.cart ?? done;
  if (done.type === 'cart' || !order.display_id) {
    throw new Error(`cart did not complete to an order: ${JSON.stringify(done).slice(0, 400)}`);
  }

  console.log('\n────────────────────────────────────────────────');
  console.log(`✅ STRIPE ORDER PLACED  #${order.display_id}  (${order.id})`);
  console.log(`   PaymentIntent = ${piId} (${confirmed.status})`);
  console.log(`   total = ${order.total} ${order.currency_code}`);
  console.log('   ⚠️ TEST order + TEST PaymentIntent (no real money) — archive the order when convenient.');
  console.log('────────────────────────────────────────────────');
})().catch((e) => {
  console.error('\n❌ FAILED:', e.message);
  process.exit(1);
});
