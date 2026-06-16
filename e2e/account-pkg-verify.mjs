/**
 * T48 — Node-level customer-account verification (no browser, no CORS).
 *
 * Exercises the SAME package code the account area runs — the
 * `@geniemarketing/commerce` Medusa client's customer surface — through the full
 * lifecycle against the LIVE shared Medusa: register → login → read → update
 * profile → address CRUD → list orders. Proves the Store customer/auth API the
 * /account/* routes depend on, without needing the Amplify redeploy (the browser
 * proof additionally needs the deploy + the touchvodka.com origin, since shop-api
 * STORE_CORS only allowlists deployed origins).
 *
 *   node e2e/account-pkg-verify.mjs
 *
 * NOTE: creates ONE throwaway customer in prod Medusa (the Store API has no
 * customer-delete) — flagged below for admin cleanup. Addresses it creates are
 * deleted by the run.
 */
import { createMedusaClient } from '@geniemarketing/commerce';

const CONFIG = {
  medusaUrl: 'https://shop-api.fatdogspirits.com',
  publishableKey: 'pk_5e0ff365944b83fd4cbd2b10483f626f67d89aa9bb3f333b5cced124d58d52eb',
  regionId: 'reg_01KTQK4KQZVYM4NBG80J28J4CV',
};

const stamp = Date.now();
const EMAIL = `t48-verify+${stamp}@touchvodka.test`;
const PASSWORD = `Test-${stamp}!`;

const ADDR = {
  first_name: 'Dana',
  last_name: 'Tester',
  address_1: '500 Bayshore Blvd',
  city: 'Tampa',
  province: 'FL',
  postal_code: '33606',
  country_code: 'us',
  phone: '8135550100',
};

const medusa = createMedusaClient(CONFIG);
const step = (n, msg) => console.log(`  ${n}. ${msg}`);

(async () => {
  console.log('T48 customer account (package code) → live shop-api\n');
  console.log(`  test customer: ${EMAIL}\n`);

  step(1, 'register (emailpass identity → /store/customers → re-login)');
  const created = await medusa.register({
    email: EMAIL,
    password: PASSWORD,
    firstName: 'Dana',
    lastName: 'Tester',
  });
  console.log(`     → customer ${created.id} (has_account=${created.has_account})`);

  step(2, 'logout then login (fresh session)');
  medusa.logout();
  const me = await medusa.login(EMAIL, PASSWORD);
  if (me.email !== EMAIL) throw new Error(`login returned wrong customer: ${me.email}`);
  console.log(`     → token present=${Boolean(medusa.getAuthToken())}, email=${me.email}`);

  step(3, 'getCustomer (fields=*addresses)');
  const customer = await medusa.getCustomer();
  if (!customer) throw new Error('getCustomer returned null for a live session');
  console.log(`     → ${customer.first_name} ${customer.last_name} | addresses=${customer.addresses?.length ?? 0}`);

  step(4, 'updateProfile (rename + phone)');
  const updated = await medusa.updateProfile({ first_name: 'Dana-Updated', phone: '8135559999' });
  if (updated.first_name !== 'Dana-Updated') throw new Error('profile update did not persist');
  console.log(`     → first_name=${updated.first_name}, phone=${updated.phone}`);

  step(5, 'addAddress');
  const afterAdd = await medusa.addAddress(ADDR);
  const addresses = afterAdd.addresses ?? (await medusa.listAddresses());
  const addr = addresses.find((a) => a.address_1 === ADDR.address_1) ?? addresses[0];
  if (!addr?.id) throw new Error('address was not created');
  console.log(`     → addr ${addr.id} (${addr.city})`);

  step(6, 'listAddresses');
  const list = await medusa.listAddresses();
  console.log(`     → ${list.length} saved address(es)`);

  step(7, 'updateAddress (city → Miami)');
  await medusa.updateAddress(addr.id, { city: 'Miami' });
  const reread = (await medusa.listAddresses()).find((a) => a.id === addr.id);
  if (reread?.city !== 'Miami') throw new Error(`address update did not persist (city=${reread?.city})`);
  console.log(`     → city=${reread.city}`);

  step(8, 'deleteAddress');
  const afterDelete = await medusa.deleteAddress(addr.id);
  const stillThere = (afterDelete.addresses ?? (await medusa.listAddresses())).some(
    (a) => a.id === addr.id,
  );
  if (stillThere) throw new Error('address was not deleted');
  console.log('     → deleted');

  step(9, 'listOrders (customer-scoped)');
  const { orders, count } = await medusa.listOrders({ limit: 5 });
  console.log(`     → ${count} order(s) on this account`);

  console.log('\n────────────────────────────────────────────────');
  console.log('✅ ACCOUNT API VERIFIED end-to-end on live shop-api');
  console.log(`   register · login · getCustomer · updateProfile · address CRUD · listOrders`);
  console.log(`   ⚠️ TEST customer ${EMAIL} persists in prod admin — archive when convenient.`);
  console.log('────────────────────────────────────────────────');
})().catch((e) => {
  console.error('\n❌ FAILED:', e.message);
  process.exit(1);
});
