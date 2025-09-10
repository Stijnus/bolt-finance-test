import React, { useState } from 'react'
import { useBudget } from '../hooks/useBudget'
import { BudgetForm } from './BudgetForm'
import { Modal } from './Modal'
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, Target } from 'lucide-react'
import { BudgetWithSpending } from '../types'
import { EXPENSE_CATEGORIES } from '../types/constants'

export const Budget: React.FC = () => {
  const { budgets, alerts, loading, fetchBudgets, createBudget, updateBudget, deleteBudget, markAlertAsRead, markAllAlertsAsRead } = useBudget()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const handleCreateBudget = async (budgetData: any) => {
    try {
      await createBudget({ ...budgetData, month: selectedMonth })
      fetchBudgets(selectedMonth)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error creating budget:', error)
    }
  }

  const handleUpdateBudget = async (budgetData: any) => {
    if (!editingBudget) return
    try {
      await updateBudget(editingBudget.id, budgetData)
      fetchBudgets(selectedMonth)
      setIsModalOpen(false)
      setEditingBudget(null)
    } catch (error) {
      console.error('Error updating budget:', error)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    try {
      await deleteBudget(budgetId)
      fetchBudgets(selectedMonth)
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 90) return 'bg-yellow-500'
    if (percentage >= 75) return 'bg-orange-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Budgets</h2>
        <div className="flex space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value)
              fetchBudgets(e.target.value)
            }}
            className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600"
          />
          <button
            onClick={() => {
              setEditingBudget(null)
              setIsModalOpen(true)
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-200 font-medium">Budget Alerts</span>
            </div>
            <button
              onClick={markAllAlertsAsRead}
              className="text-yellow-300 hover:text-yellow-100 text-sm"
            >
              Mark all as read
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="text-yellow-100 text-sm flex justify-between">
                <span>{alert.message}</span>
                {!alert.is_read && (
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="text-yellow-300 hover:text-yellow-100"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{budget.category}</h3>
                <p className="text-gray-400 text-sm">Budget: ${budget.amount.toFixed(2)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingBudget(budget)
                    setIsModalOpen(true)
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Spent</span>
                <span className="text-white">${budget.actualSpending.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.percentageUsed)}`}
                  style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {budget.percentageUsed.toFixed(1)}% used
                </span>
                <span className={`font-medium ${budget.isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                  ${budget.remaining.toFixed(2)} left
                </span>
              </div>
            </div>

            {budget.isOverBudget && (
              <div className="mt-4 flex items-center text-red-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Over budget by ${(budget.actualSpending - budget.amount).toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No budgets set</h3>
          <p className="text-gray-500 mb-4">Create your first budget to start tracking expenses.</p>
          <button
            onClick={() => {
              setEditingBudget(null)
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Budget
          </button>
        </div>
      )}

      <Modal 
        title={editingBudget ? "Edit Budget" : "Create Budget"}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        <BudgetForm
          initialData={editingBudget}
          categories={EXPENSE_CATEGORIES}
          onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
