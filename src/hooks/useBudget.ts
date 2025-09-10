import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Budget, BudgetWithSpending, BudgetAlert } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export const useBudget = () => {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchBudgets = async (month?: string) => {
    if (!user) return

    try {
      setLoading(true)
      const targetMonth = month || format(new Date(), 'yyyy-MM')
      
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)

      if (!budgetsData) return

      const budgetsWithSpending = await Promise.all(
        budgetsData.map(async (budget) => {
          const monthStart = format(startOfMonth(new Date(budget.month + '-01')), 'yyyy-MM-dd')
          const monthEnd = format(endOfMonth(new Date(budget.month + '-01')), 'yyyy-MM-dd')

          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .eq('category', budget.category)
            .gte('date', monthStart)
            .lte('date', monthEnd)

          const actualSpending = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
          const remaining = budget.amount - actualSpending
          const percentageUsed = budget.amount > 0 ? (actualSpending / budget.amount) * 100 : 0

          return {
            ...budget,
            actualSpending,
            remaining,
            percentageUsed,
            isOverBudget: actualSpending > budget.amount
          }
        })
      )

      setBudgets(budgetsWithSpending)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    if (!user) return

    try {
      const { data: alertsData } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setAlerts(alertsData || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const createBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budget,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  const markAlertAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ))
  }

  const markAllAlertsAsRead = async () => {
    if (!user) return

    const { error } = await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw error
    setAlerts(alerts.map(alert => ({ ...alert, is_read: true })))
  }

  useEffect(() => {
    if (user) {
      fetchBudgets()
      fetchAlerts()
    }
  }, [user])

  return {
    budgets,
    alerts,
    loading,
    fetchBudgets,
    fetchAlerts,
    createBudget,
    updateBudget,
    deleteBudget,
    markAlertAsRead,
    markAllAlertsAsRead
  }
}
