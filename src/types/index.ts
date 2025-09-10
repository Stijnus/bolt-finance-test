import { EXPENSE_CATEGORIES, PAYMENT_METHODS, BUDGET_ALERT_TYPES, BUDGET_THRESHOLDS } from './constants'

export interface User {
  id: string
  email: string
}

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  category?: string
  paymentMethod?: string
}

export interface DashboardStats {
  totalThisMonth: number
  totalLastMonth: number
  percentageChange: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    amount: number
  }>
}

export interface Budget {
  id: string
  user_id: string
  amount: number
  category: string
  month: string // YYYY-MM format
  created_at: string
  updated_at: string
}

export interface BudgetWithSpending extends Budget {
  actualSpending: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
}

export interface BudgetAlert {
  id: string
  user_id: string
  budget_id: string
  type: 'threshold' | 'over_budget' | 'monthly_summary'
  message: string
  is_read: boolean
  created_at: string
}

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
export type PaymentMethod = typeof PAYMENT_METHODS[number]

// Re-export constants
export { EXPENSE_CATEGORIES, PAYMENT_METHODS, BUDGET_ALERT_TYPES, BUDGET_THRESHOLDS }
