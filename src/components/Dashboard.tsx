import React from 'react'
import { useDashboard } from '../hooks/useDashboard'
import { useBudget } from '../hooks/useBudget'
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target } from 'lucide-react'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export const Dashboard: React.FC = () => {
  const { stats, loading: statsLoading } = useDashboard()
  const { budgets, loading: budgetLoading } = useBudget()

  const loading = statsLoading || budgetLoading

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="card-content">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const isIncrease = stats.percentageChange > 0

  // Calculate budget summary
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.actualSpending, 0)
  const budgetPercentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
  const remainingBudget = totalBudgeted - totalSpent
  const isOverBudget = totalSpent > totalBudgeted

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalThisMonth.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalLastMonth.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isIncrease ? 'bg-red-100' : 'bg-green-100'}`}>
                {isIncrease ? (
                  <TrendingUp className="h-6 w-6 text-red-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Change</p>
                <p className={`text-2xl font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                  {isIncrease ? '+' : ''}{stats.percentageChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}>
                <Target className={`h-6 w-6 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget Summary</p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {budgetPercentageUsed.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  ${remainingBudget.toFixed(2)} remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
          </div>
          <div className="card-content">
            {stats.categoryBreakdown.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {stats.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No expenses this month
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">6-Month Trend</h3>
          </div>
          <div className="card-content">
            {stats.monthlyTrend.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Details */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Category Details</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {stats.categoryBreakdown.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${category.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
