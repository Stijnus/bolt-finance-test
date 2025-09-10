import React from 'react'
import { useForm } from 'react-hook-form'
import { Calendar, DollarSign } from 'lucide-react'
import { BudgetWithSpending } from '../types'

interface BudgetFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: BudgetWithSpending | null
  categories: readonly string[]
  onCancel: () => void
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  categories,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData ? {
      category: initialData.category,
      amount: initialData.amount.toString(),
      month: initialData.month
    } : {
      category: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7) // YYYY-MM
    }
  })

  const submitForm = async (data: any) => {
    await onSubmit({
      ...data,
      amount: parseFloat(data.amount)
    })
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="input"
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Budget Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
            className="input pl-10"
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Month */}
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Month
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="month"
            id="month"
            {...register('month', { required: 'Month is required' })}
            className="input pl-10"
          />
        </div>
        {errors.month && (
          <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Budget
        </button>
      </div>
    </form>
  )
}
