import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DashboardStats } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      const now = new Date()
      const thisMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const thisMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
      const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
      const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

      // Get this month's expenses
      const { data: thisMonthExpenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('date', thisMonthStart)
        .lte('date', thisMonthEnd)

      // Get last month's expenses
      const { data: lastMonthExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', lastMonthStart)
        .lte('date', lastMonthEnd)

      // Get last 6 months data for trend
      const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')
      const { data: trendData } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo)
        .order('date', { ascending: true })

      // Calculate totals
      const totalThisMonth = thisMonthExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
      const totalLastMonth = lastMonthExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
      
      const percentageChange = totalLastMonth > 0 
        ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
        : 0

      // Calculate category breakdown
      const categoryTotals = thisMonthExpenses?.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
        return acc
      }, {} as Record<string, number>) || {}

      const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalThisMonth > 0 ? (amount / totalThisMonth) * 100 : 0
      })).sort((a, b) => b.amount - a.amount)

      // Calculate monthly trend
      const monthlyTotals = trendData?.reduce((acc, exp) => {
        const month = format(new Date(exp.date), 'MMM yyyy')
        acc[month] = (acc[month] || 0) + Number(exp.amount)
        return acc
      }, {} as Record<string, number>) || {}

      const monthlyTrend = Object.entries(monthlyTotals).map(([month, amount]) => ({
        month,
        amount
      }))

      setStats({
        totalThisMonth,
        totalLastMonth,
        percentageChange,
        categoryBreakdown,
        monthlyTrend
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [user])

  return { stats, loading, refetch: fetchDashboardStats }
}
