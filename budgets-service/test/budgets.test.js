import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';
import { clearBudgets } from '../src/repositories/budgetRepository.js';

let server;
let base;
const tokenFor = (id) => jwt.sign({ sub: id, email: `${id}@e.com` }, getConfig().jwtSecret, { algorithm: 'HS256' });
const headers = (id = 'u1') => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor(id)}` });
const post = (body, id) => fetch(`${base}/api/budgets`, { method: 'POST', headers: headers(id), body: JSON.stringify(body) });
const valid = { limitAmount: 150000, category: 'Alimentación', period: 'mensual' };

before(async () => {
  console.log = () => {};
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => clearBudgets());

test('health responde ok sin sesión', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

test('rechaza peticiones sin token o con token falso', async () => {
  assert.equal((await fetch(`${base}/api/budgets`)).status, 401);
  const forged = jwt.sign({ sub: 'x' }, 'otro-secreto');
  const res = await fetch(`${base}/api/budgets`, { headers: { Authorization: `Bearer ${forged}` } });
  assert.equal(res.status, 401);
});

test('crea un presupuesto válido', async () => {
  const res = await post(valid);
  assert.equal(res.status, 201);
  const { budget } = await res.json();
  assert.ok(budget.id);
  assert.equal(budget.limitAmount, 150000);
  assert.equal(budget.category, 'Alimentación');
  assert.equal(budget.period, 'mensual');
  assert.ok(budget.createdAt);
  assert.equal(budget.userId, undefined);
});

test('crea un presupuesto válido usando alias en español', async () => {
  const res = await post({ monto: 50000, categoria: 'Transporte', periodo: 'semanal' });
  assert.equal(res.status, 201);
  const { budget } = await res.json();
  assert.equal(budget.limitAmount, 50000);
  assert.equal(budget.category, 'Transporte');
  assert.equal(budget.period, 'semanal');
});

test('rechaza monto, categoría y período inválidos', async () => {
  assert.equal((await post({ ...valid, limitAmount: -10 })).status, 400);
  assert.equal((await post({ ...valid, limitAmount: 'cien' })).status, 400);
  assert.equal((await post({ ...valid, category: 'Desconocida' })).status, 400);
  assert.equal((await post({ ...valid, period: 'diario' })).status, 400);
});

test('lista solo los presupuestos del usuario, con filtros', async () => {
  await post(valid, 'u1');
  await post({ limitAmount: 40000, category: 'Ocio', period: 'semanal' }, 'u1');
  await post(valid, 'u2');

  const all = await (await fetch(`${base}/api/budgets`, { headers: headers('u1') })).json();
  assert.equal(all.total, 2);
  assert.equal(all.budgets.length, 2);

  const ocio = await (await fetch(`${base}/api/budgets?category=Ocio`, { headers: headers('u1') })).json();
  assert.equal(ocio.total, 1);
  assert.equal(ocio.budgets[0].category, 'Ocio');

  const mensual = await (await fetch(`${base}/api/budgets?period=mensual`, { headers: headers('u1') })).json();
  assert.equal(mensual.total, 1);
  assert.equal(mensual.budgets[0].period, 'mensual');

  const badCategory = await fetch(`${base}/api/budgets?category=Invalida`, { headers: headers('u1') });
  assert.equal(badCategory.status, 400);

  const badPeriod = await fetch(`${base}/api/budgets?period=invalido`, { headers: headers('u1') });
  assert.equal(badPeriod.status, 400);
});
