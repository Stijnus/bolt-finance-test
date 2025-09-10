import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Expense, ExpenseInsert, ExpenseUpdate } from '../types/database'
import { ExpenseFilters } from '../types'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const useExpenses = (filters?: ExpenseFilters) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchExpenses = async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      const { data, error } = await query

      if (error) throw error

      setExpenses(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: Omit<ExpenseInsert, 'user_id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setExpenses(prev => [data, ...prev])
      toast.success('Expense added successfully!')
      return data
    } catch (err) {
      toast.error('Failed to add expense')
      throw err
    }
  }

  const updateExpense = async (id: string, updates: ExpenseUpdate) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp))
      toast.success('Expense updated successfully!')
      return data
    } catch (err) {
      toast.error('Failed to update expense')
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExpenses(prev => prev.filter(exp => exp.id !== id))
      toast.success('Expense deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete expense')
      throw err
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [user, filters])

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  }
}
