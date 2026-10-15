import { CATEGORIES, isValidCategory } from '../modules/categories.js';
import { evaluateOverspending } from '../modules/budgetEvaluator.js';
import {
  createNotification,
  findByUser,
  markAsRead,
  toPublicNotification,
} from '../repositories/notificationRepository.js';

export const handleTransactionEvent = async (req, res) => {
  const body = req.body ?? {};
  const rawAmount = body.amount ?? body.monto;
  const category = body.category ?? body.categoria;
  const date = body.date ?? body.fecha;
  const rawBudgetLimit = body.budgetLimit ?? body.limitePresupuesto ?? body.limit ?? body.montoLimite;
  const rawCurrentSpent = body.currentSpent ?? body.gastoPrevio ?? body.spent;

  if (typeof rawAmount !== 'number' || !Number.isFinite(rawAmount) || rawAmount <= 0) {
    return res.status(400).json({ error: 'El monto de la transacción debe ser un número mayor a 0' });
  }

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: `Categoría inválida. Permitidas: ${CATEGORIES.join(', ')}` });
  }

  const amount = Math.round(rawAmount * 100) / 100;
  const budgetLimit = typeof rawBudgetLimit === 'number' && Number.isFinite(rawBudgetLimit) ? rawBudgetLimit : undefined;
  const currentSpent = typeof rawCurrentSpent === 'number' && Number.isFinite(rawCurrentSpent) ? rawCurrentSpent : undefined;

  const evaluation = await evaluateOverspending({
    userId: req.user.id,
    category,
    amount,
    date,
    budgetLimit,
    currentSpent,
    token: req.token,
  });

  if (evaluation.isOverspent) {
    const alert = await createNotification({
      userId: req.user.id,
      type: 'OVERSPENDING_ALERT',
      category,
      amount,
      budgetLimit: evaluation.budgetLimit,
      totalSpent: evaluation.totalSpent,
      overspentAmount: evaluation.overspentAmount,
      percentage: evaluation.percentage,
      message: evaluation.message,
      severity: evaluation.severity,
      date,
      metadata: {
        transactionId: body.transactionId ?? body.id,
        description: body.description ?? body.descripcion ?? '',
      },
    });

    return res.status(201).json({
      alertGenerated: true,
      alert: toPublicNotification(alert),
      evaluation,
    });
  }

  return res.status(200).json({
    alertGenerated: false,
    message: evaluation.message,
    evaluation,
  });
};

export const list = async (req, res) => {
  const { read, type } = req.query;
  const items = await findByUser(req.user.id, { read, type });
  return res.status(200).json({
    notifications: items.map(toPublicNotification),
    total: items.length,
  });
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  const item = await markAsRead(id, req.user.id);
  if (!item) {
    return res.status(404).json({ error: 'Notificación no encontrada' });
  }
  return res.status(200).json({ notification: toPublicNotification(item) });
};
