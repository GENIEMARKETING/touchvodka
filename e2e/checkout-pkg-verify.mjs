/**
 * S10 — Node-level checkout verification (no browser, no CORS).
 *
 * Exercises the SAME package code the storefront runs — `createMedusaClient`,
 * `createPaymentsClient`, and a replica of the fixed `lib/checkout.ts` `store()`
 * (resolveConfig WITH explicit medusaUrl/publishableKey) — through the full DTC
 * purchase against the LIVE shared Medusa, completing a manual TEST order.
 *
 * This proves the lib/checkout.ts + checkout.tsx fix (pass config explicitly so
 * the calls hit shop-api with the publishable key, instead of resolveConfig()'s
 * commerce.vinny.agency fallback). Browser-level proof additionally needs the
 * Amplify redeploy (build-time inlining) + the touchvodka.com origin (shop-api
 * STORE_CORS only allowlists deployed origins, not localhost).
 *
 *   node e2e/checkout-pkg-verify.mjs
 */
import { createMedusaClient, resolveConfig } from '@geniemarketing/commerce';
import { createPaymentsClient } from '@geniemarketing/commerce/payments';

const CONFIG = {
  medusaUrl: 'https://shop-api.fatdogspirits.com',
  publishableKey: 'pk_5e0ff365944b83fd4cbd2b10483f626f67d89aa9bb3f333b5cced124d58d52eb',
  regionId: 'reg_01KTQK4KQZVYM4NBG80J28J4CV',
};

const medusa = createMedusaClient(CONFIG);
const payments = createPaymentsClient(CONFIG);

// Replica of the FIXED lib/checkout.ts store() — resolveConfig WITH explicit config.
async function store(path, opts = {}) {
  const cfg = resolveConfig({ medusaUrl: CONFIG.medusaUrl, publishableKey: CONFIG.publishableKey });
  const url = new URL(`/store/${path}`, cfg.medusaUrl);
  for (const [k, v] of Object.entries(opts.params ?? {})) url.searchParams.set(k, v);
  const headers = {};
  if (cfg.publishableKey) headers['x-publishable-api-key'] = cfg.publishableKey;
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Medusa ${res.status} ${opts.method ?? 'GET'} /store/${path}: ${await res.text()}`);
  return res.json();
}

const ADDR = {
  first_name: 'Test',
  last_name: 'Buyer',
  address_1: '123 Congress Ave',
  city: 'Austin',
  province: 'TX',
  postal_code: '78701',
  country_code: 'us',
  phone: '5125550100',
};

const step = (n, msg) => console.log(`  ${n}. ${msg}`);

(async () => {
  console.log('S10 checkout (package code, manual provider) → live shop-api\n');

  step(1, 'listProducts (published client, explicit config)');
  const products = await medusa.listProducts({ limit: 1 });
  const product = products.products?.[0] ?? products[0];
  const variantId = product.variants[0].id;
  console.log(`     → ${product.title} variant ${variantId}`);

  step(2, 'createCart(region)');
  const cart = await medusa.createCart(CONFIG.regionId);
  console.log(`     → ${cart.id} region=${cart.region_id} ${cart.currency_code}`);

  step(3, 'addLineItem');
  await medusa.addLineItem(cart.id, variantId, 1);

  step(4, 'setEmail');
  await medusa.setEmail(cart.id, 's10-pkg-verify@touchvodka.test');

  step(5, 'setAddresses (FIXED shim)');
  await store(`carts/${cart.id}`, { method: 'POST', body: { shipping_address: ADDR, billing_address: ADDR } });

  step(6, 'listShippingOptions (FIXED shim)');
  const { shipping_options } = await store('shipping-options', { params: { cart_id: cart.id } });
  if (!shipping_options?.length) throw new Error('no shipping options');
  console.log(`     → ${shipping_options.map((o) => `${o.name} $${o.amount}`).join(', ')}`);

  step(7, 'addShippingMethod (FIXED shim)');
  await store(`carts/${cart.id}/shipping-methods`, { method: 'POST', body: { option_id: shipping_options[0].id } });

  step(8, 'listProviders + initSession (payments client, explicit config)');
  const providers = await payments.listProviders(CONFIG.regionId);
  console.log(`     → providers: ${providers.map((p) => `${p.id}(${p.kind})`).join(', ')}`);
  const provider = providers[0];
  const session = await payments.initSession(cart.id, provider.id);
  console.log(`     → session provider=${session.provider_id}`);

  step(9, 'completeCart (manual — session alone authorises a TEST order)');
  const order = await medusa.completeCart(cart.id);

  console.log('\n────────────────────────────────────────────────');
  console.log(`✅ ORDER PLACED  #${order.display_id}  (${order.id})`);
  console.log(`   total = ${(order.total / 1).toFixed(2)} ${order.currency_code}`);
  console.log(`   provider = ${provider.id} (${provider.kind})`);
  console.log('   ⚠️ TEST order in prod admin — archive when convenient.');
  console.log('────────────────────────────────────────────────');
})().catch((e) => {
  console.error('\n❌ FAILED:', e.message);
  process.exit(1);
});
