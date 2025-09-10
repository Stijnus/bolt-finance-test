import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../types'
import { ExpenseInsert } from '../types/database'
import { format } from 'date-fns'

const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  payment_method: z.string().min(1, 'Payment method is required'),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  onSubmit: (data: Omit<ExpenseInsert, 'user_id'>) => Promise<void>
  initialData?: Partial<ExpenseFormData>
  loading?: boolean
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      ...initialData
    }
  })

  const onFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data)
    if (!initialData) {
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="input mt-1"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            className="input mt-1"
            {...register('category')}
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            id="date"
            type="date"
            className="input mt-1"
            {...register('date')}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
            Payment Method *
          </label>
          <select
            id="payment_method"
            className="input mt-1"
            {...register('payment_method')}
          >
            <option value="">Select payment method</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="input mt-1 resize-none"
          placeholder="Optional description..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary px-6 py-2"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
        </button>
      </div>
    </form>
  )
}
