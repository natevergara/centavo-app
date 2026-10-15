import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';
import { clearTransactions } from '../src/repositories/transactionRepository.js';

let server;
let base;
const tokenFor = (id) => jwt.sign({ sub: id, email: `${id}@e.com` }, getConfig().jwtSecret, { algorithm: 'HS256' });
const headers = (id = 'u1') => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor(id)}` });
const post = (body, id) => fetch(`${base}/api/transactions`, { method: 'POST', headers: headers(id), body: JSON.stringify(body) });
const valid = { amount: 25.5, category: 'Alimentación', date: '2026-10-01', description: 'Almuerzo' };

before(async () => {
  console.log = () => {};
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => clearTransactions());

test('health responde ok sin sesión', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

test('rechaza peticiones sin token o con token falso', async () => {
  assert.equal((await fetch(`${base}/api/transactions`)).status, 401);
  const forged = jwt.sign({ sub: 'x' }, 'otro-secreto');
  const res = await fetch(`${base}/api/transactions`, { headers: { Authorization: `Bearer ${forged}` } });
  assert.equal(res.status, 401);
});

test('crea una transacción válida', async () => {
  const res = await post(valid);
  assert.equal(res.status, 201);
  const { transaction } = await res.json();
  assert.ok(transaction.id);
  assert.equal(transaction.amount, 25.5);
  assert.equal(transaction.userId, undefined);
});

test('rechaza monto, categoría y fecha inválidos', async () => {
  assert.equal((await post({ ...valid, amount: -5 })).status, 400);
  assert.equal((await post({ ...valid, amount: '10' })).status, 400);
  assert.equal((await post({ ...valid, category: 'Inventada' })).status, 400);
  assert.equal((await post({ ...valid, date: '2026-02-31' })).status, 400);
  assert.equal((await post({ ...valid, date: 'ayer' })).status, 400);
});

test('lista solo las transacciones del usuario, con filtros', async () => {
  await post(valid, 'u1');
  await post({ ...valid, category: 'Ocio', date: '2026-10-05' }, 'u1');
  await post(valid, 'u2');

  const all = await (await fetch(`${base}/api/transactions`, { headers: headers('u1') })).json();
  assert.equal(all.total, 2);
  assert.equal(all.transactions[0].date, '2026-10-05'); // más reciente primero

  const ocio = await (await fetch(`${base}/api/transactions?category=Ocio`, { headers: headers('u1') })).json();
  assert.equal(ocio.total, 1);

  const bad = await fetch(`${base}/api/transactions?from=xx`, { headers: headers('u1') });
  assert.equal(bad.status, 400);
});
