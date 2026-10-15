import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';
import { clearNotifications } from '../src/repositories/notificationRepository.js';

let server;
let base;
let mockBudgetsServer;
let mockBudgetsPort;

const tokenFor = (id) => jwt.sign({ sub: id, email: `${id}@e.com` }, getConfig().jwtSecret, { algorithm: 'HS256' });
const headers = (id = 'u1') => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor(id)}` });
const postEvent = (body, id) =>
  fetch(`${base}/api/notifications/events/transaction`, {
    method: 'POST',
    headers: id ? headers(id) : { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

before(async () => {
  console.log = () => {};

  // Mock server para simular budgets-service
  mockBudgetsServer = http.createServer((req, res) => {
    if (req.url.startsWith('/api/budgets')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          budgets: [
            { category: 'Alimentación', limitAmount: 100000, period: 'mensual' },
            { category: 'Transporte', limitAmount: 30000, period: 'mensual' },
          ],
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise((r) => mockBudgetsServer.listen(0, r));
  mockBudgetsPort = mockBudgetsServer.address().port;
  process.env.BUDGETS_SERVICE_URL = `http://127.0.0.1:${mockBudgetsPort}`;

  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  mockBudgetsServer.close();
});

beforeEach(() => {
  clearNotifications();
});

test('health responde ok sin sesión', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('rechaza peticiones a listar sin token o con token falso', async () => {
  assert.equal((await fetch(`${base}/api/notifications`)).status, 401);
  const forged = jwt.sign({ sub: 'x' }, 'otro-secreto');
  const res = await fetch(`${base}/api/notifications`, { headers: { Authorization: `Bearer ${forged}` } });
  assert.equal(res.status, 401);
});

test('rechaza evento sin token y sin userId en payload', async () => {
  const res = await postEvent({ amount: 5000, category: 'Alimentación' }, null);
  assert.equal(res.status, 401);
});

test('rechaza monto inválido o categoría inválida', async () => {
  const resNeg = await postEvent({ amount: -10, category: 'Alimentación' }, 'u1');
  assert.equal(resNeg.status, 400);

  const resZero = await postEvent({ amount: 0, category: 'Alimentación' }, 'u1');
  assert.equal(resZero.status, 400);

  const resCat = await postEvent({ amount: 5000, category: 'Inexistente' }, 'u1');
  assert.equal(resCat.status, 400);
});

test('genera alerta cuando el gasto excede el presupuesto provisto en el payload (201 Created)', async () => {
  const payload = {
    amount: 60000,
    category: 'Alimentación',
    budgetLimit: 50000,
    currentSpent: 10000, // Total = 70000 > 50000
    description: 'Cena familiar',
  };

  const res = await postEvent(payload, 'u1');
  assert.equal(res.status, 201);
  const data = await res.json();

  assert.equal(data.alertGenerated, true);
  assert.ok(data.alert);
  assert.equal(data.alert.category, 'Alimentación');
  assert.equal(data.alert.budgetLimit, 50000);
  assert.equal(data.alert.totalSpent, 70000);
  assert.equal(data.alert.overspentAmount, 20000);
  assert.equal(data.alert.percentage, 140);
  assert.equal(data.alert.severity, 'critical');
  assert.equal(data.alert.read, false);
});

test('no genera alerta cuando el gasto está dentro del presupuesto provisto (200 OK)', async () => {
  const payload = {
    amount: 15000,
    category: 'Alimentación',
    budgetLimit: 50000,
    currentSpent: 10000, // Total = 25000 <= 50000
  };

  const res = await postEvent(payload, 'u1');
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.alertGenerated, false);
  assert.equal(data.alert, undefined);
  assert.equal(data.evaluation.isOverspent, false);
  assert.equal(data.evaluation.totalSpent, 25000);
});

test('admite alias en español y userId directo en el evento (sin Bearer)', async () => {
  const payload = {
    usuarioId: 'u2',
    monto: 80000,
    categoria: 'Transporte',
    limitePresupuesto: 50000,
    gastoPrevio: 0,
  };

  const res = await postEvent(payload, null);
  assert.equal(res.status, 201);
  const data = await res.json();

  assert.equal(data.alertGenerated, true);
  assert.equal(data.alert.category, 'Transporte');
  assert.equal(data.alert.overspentAmount, 30000);
});

test('consulta presupuesto remoto en budgets-service si no viene en payload', async () => {
  // Mock budgets-service define Transporte con limitAmount 30000
  const payload = {
    amount: 35000,
    category: 'Transporte',
    currentSpent: 0,
  };

  const res = await postEvent(payload, 'u1');
  assert.equal(res.status, 201);
  const data = await res.json();

  assert.equal(data.alertGenerated, true);
  assert.equal(data.alert.budgetLimit, 30000);
  assert.equal(data.alert.totalSpent, 35000);
  assert.equal(data.alert.overspentAmount, 5000);
});

test('lista solo notificaciones del usuario y permite filtrar y marcar como leída', async () => {
  // Crear 2 alertas para u1 y 1 para u2
  await postEvent({ amount: 60000, category: 'Alimentación', budgetLimit: 50000 }, 'u1');
  await postEvent({ amount: 70000, category: 'Transporte', budgetLimit: 30000 }, 'u1');
  await postEvent({ amount: 60000, category: 'Alimentación', budgetLimit: 50000 }, 'u2');

  const listRes = await fetch(`${base}/api/notifications`, { headers: headers('u1') });
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.total, 2);
  assert.equal(listData.notifications.length, 2);

  const alertId = listData.notifications[0].id;

  // Marcar como leída
  const patchRes = await fetch(`${base}/api/notifications/${alertId}/read`, {
    method: 'PATCH',
    headers: headers('u1'),
  });
  assert.equal(patchRes.status, 200);
  const patchData = await patchRes.json();
  assert.equal(patchData.notification.read, true);

  // Filtrar no leídas
  const unreadRes = await fetch(`${base}/api/notifications?read=false`, { headers: headers('u1') });
  const unreadData = await unreadRes.json();
  assert.equal(unreadData.total, 1);
});
