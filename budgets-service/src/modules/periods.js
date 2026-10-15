export const PERIODS = ['semanal', 'mensual', 'anual'];

export const normalizePeriod = (value) => {
  if (typeof value !== 'string') return null;
  const val = value.trim().toLowerCase();
  if (val === 'weekly') return 'semanal';
  if (val === 'monthly') return 'mensual';
  if (val === 'yearly' || val === 'annual') return 'anual';
  return PERIODS.includes(val) ? val : null;
};

export const isValidPeriod = (value) => normalizePeriod(value) !== null;
