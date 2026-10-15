import { getConfig } from '../config.js';

export const evaluateOverspending = async ({
  userId,
  category,
  amount,
  date,
  budgetLimit,
  currentSpent,
  token,
}) => {
  let resolvedLimit = typeof budgetLimit === 'number' && Number.isFinite(budgetLimit) ? budgetLimit : null;
  let resolvedSpent = typeof currentSpent === 'number' && Number.isFinite(currentSpent) ? currentSpent : null;

  // Si no se proveyó el límite directamente en el evento, consultamos a budgets-service
  if (resolvedLimit === null && token) {
    try {
      const { budgetsServiceUrl } = getConfig();
      const res = await fetch(`${budgetsServiceUrl}/api/budgets?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const found = data.budgets?.find((b) => b.category === category) || data.budgets?.[0];
        if (found && typeof found.limitAmount === 'number') {
          resolvedLimit = found.limitAmount;
        }
      }
    } catch {
      // Si falla la consulta remota, resolvedLimit permanece null
    }
  }

  // Si no se proveyó el gasto previo y tenemos token, consultamos transactions-service
  if (resolvedSpent === null && token) {
    try {
      const { transactionsServiceUrl } = getConfig();
      const res = await fetch(`${transactionsServiceUrl}/api/transactions?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.transactions) ? data.transactions : [];
        resolvedSpent = list.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      }
    } catch {
      // Si falla la consulta remota, resolvedSpent permanece null
    }
  }

  // Si no hay presupuesto definido para esta categoría
  if (resolvedLimit === null) {
    return {
      hasBudget: false,
      isOverspent: false,
      budgetLimit: null,
      currentSpent: resolvedSpent ?? 0,
      totalSpent: (resolvedSpent ?? 0) + amount,
      overspentAmount: 0,
      percentage: null,
      message: `No hay presupuesto configurado para la categoría ${category}`,
    };
  }

  const previousSpent = resolvedSpent ?? 0;
  const totalSpent = Math.round((previousSpent + amount) * 100) / 100;
  const isOverspent = totalSpent > resolvedLimit;
  const overspentAmount = isOverspent ? Math.round((totalSpent - resolvedLimit) * 100) / 100 : 0;
  const percentage = resolvedLimit > 0 ? Math.round((totalSpent / resolvedLimit) * 100) : 100;
  const severity = percentage >= 120 ? 'critical' : 'warning';

  const message = isOverspent
    ? `Has superado el presupuesto de ${category}. Límite: $${resolvedLimit.toLocaleString()}, Total gastado: $${totalSpent.toLocaleString()} (Excedido por $${overspentAmount.toLocaleString()})`
    : `Gasto registrado dentro del presupuesto de ${category} (${percentage}% utilizado)`;

  return {
    hasBudget: true,
    isOverspent,
    budgetLimit: resolvedLimit,
    currentSpent: previousSpent,
    totalSpent,
    overspentAmount,
    percentage,
    severity,
    message,
  };
};
