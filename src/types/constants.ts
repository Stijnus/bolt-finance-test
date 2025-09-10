export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Insurance',
  'Other'
] as const

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Digital Wallet',
  'Bank Transfer',
  'Check'
] as const

export const BUDGET_ALERT_TYPES = {
  THRESHOLD: 'threshold',
  OVER_BUDGET: 'over_budget',
  MONTHLY_SUMMARY: 'monthly_summary'
} as const

export const BUDGET_THRESHOLDS = {
  WARNING: 0.75, // 75% used
  CRITICAL: 0.9  // 90% used
} as const
