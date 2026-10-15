import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { clearUsers } from '../src/repositories/userRepository.js';

let server;
let base;
const creds = { email: 'test@example.com', password: 'securepassword123', name: 'Test' };

const post = (path, body) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

before(async () => {
  console.log = () => {};
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => clearUsers());

test('registro exitoso no expone password ni hash', async () => {
  const res = await post('/api/auth/register', creds);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.ok(body.token);
  assert.equal(body.user.passwordHash, undefined);
  assert.equal(body.user.password, undefined);
});

test('registro rechaza duplicado y datos inválidos', async () => {
  await post('/api/auth/register', creds);
  assert.equal((await post('/api/auth/register', creds)).status, 409);
  assert.equal((await post('/api/auth/register', { ...creds, email: 'x' })).status, 400);
  assert.equal((await post('/api/auth/register', { ...creds, email: 'b@e.com', password: '123' })).status, 400);
});

test('login válido e inválido', async () => {
  await post('/api/auth/register', creds);
  assert.equal((await post('/api/auth/login', creds)).status, 200);
  assert.equal((await post('/api/auth/login', { ...creds, password: 'wrongpass123' })).status, 401);
  assert.equal((await post('/api/auth/login', { email: 'no@e.com', password: 'whatever123' })).status, 401);
});

test('verify con token válido, ausente y manipulado', async () => {
  const { token } = await (await post('/api/auth/register', creds)).json();
  const ok = await fetch(base + '/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).user.email, creds.email);

  assert.equal((await fetch(base + '/api/auth/verify')).status, 401);
  const forged = jwt.sign({ sub: 'x', email: 'a@b.c' }, 'otro-secreto');
  const bad = await fetch(base + '/api/auth/verify', { headers: { Authorization: `Bearer ${forged}` } });
  assert.equal(bad.status, 401);
});
