import { Expense } from '../types/database'
import { format } from 'date-fns'

export const exportToCSV = (expenses: Expense[], filename = 'expenses.csv') => {
  const headers = ['Date', 'Amount', 'Category', 'Payment Method', 'Description']
  
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      expense.amount.toString(),
      `"${expense.category}"`,
      `"${expense.payment_method}"`,
      `"${expense.description || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
