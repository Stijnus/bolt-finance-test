import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { Budget } from '../components/Budget'

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  user_id: string
}

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other']

export const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'expenses' | 'budgets'>('expenses')
  const { user } = useAuth()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      toast.error('Error fetching expenses')
      console.error(error)
    } else {
      setExpenses(data || [])
    }
    setLoading(false)
  }

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return
    const { error } = await supabase
      .from('expenses')
      .insert([{ ...data, user_id: user.id }])

    if (error) {
      toast.error('Error adding expense')
      console.error(error)
    } else {
      toast.success('Expense added!')
      reset()
      fetchExpenses()
    }
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error deleting expense')
      console.error(error)
    } else {
      toast.success('Expense deleted!')
      fetchExpenses()
    }
  }

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date)
    const now = new Date()
    return expenseDate >= startOfMonth(now) && expenseDate <= endOfMonth(now)
  })

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const chartData = currentMonthExpenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(expense => ({
      date: format(parseISO(expense.date), 'MMM dd'),
      amount: expense.amount,
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-border">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'expenses' ? 'border-b-2 border-primary text-primary' : 'text-textSecondary hover:text-text'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'budgets' ? 'border-b-2 border-primary text-primary' : 'text-textSecondary hover:text'
          }`}
        >
          Budgets
        </button>
      </div>

      {activeTab === 'expenses' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <DollarSign className="text-primary" size={24} />
                <div>
                  <p className="text-textSecondary">Total Expenses</p>
                  <p className="text-2xl font-bold text-text">${totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-secondary" size={24} />
                <div>
                  <p className="text-textSecondary">This Month</p>
                  <p className="text-2xl font-bold text-text">{currentMonthExpenses.length} transactions</p>
                </div>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Plus className="text-accent" size={24} />
                <div>
                  <p className="text-textSecondary">Add Expense</p>
                  <p className="text-2xl font-bold text-text">Quick Form</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4 text-text">Add New Expense</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-textSecondary mb-1">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-error">{errors.amount.message}</p>}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-1">
                    Description
                  </label>
                  <input
                    id="description"
                    {...register('description')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                  {errors.description && <p className="mt-1 text-sm text-error">{errors.description.message}</p>}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-textSecondary mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-error">{errors.category.message}</p>}
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-textSecondary mb-1">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    {...register('date')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                  {errors.date && <p className="mt-1 text-sm text-error">{errors.date.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Add Expense
                </button>
              </form>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-4 text-text">Expense Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" />
                  <XAxis dataKey="date" stroke="#A3A3A3" />
                  <YAxis stroke="#A3A3A3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      border: '1px solid #2F2F2F',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#9E7FFF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-text">Recent Expenses</h3>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <p className="text-textSecondary">No expenses yet. Add your first expense above!</p>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-background rounded-md border border-border">
                    <div>
                      <p className="font-medium text-text">{expense.description}</p>
                      <p className="text-sm text-textSecondary">{expense.category} • {format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-text">${expense.amount.toFixed(2)}</span>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-error hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'budgets' && (
        <div className="bg-surface p-6 rounded-lg border border-border">
          <Budget />
        </div>
      )}
    </div>
  )
}
