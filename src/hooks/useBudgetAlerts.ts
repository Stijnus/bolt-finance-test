import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBudget } from './useBudget'
import { BUDGET_THRESHOLDS, BUDGET_ALERT_TYPES } from '../types/constants'

export const useBudgetAlerts = () => {
  const { budgets } = useBudget()

  useEffect(() => {
    const checkBudgetsAndCreateAlerts = async () => {
      for (const budget of budgets) {
        const { actualSpending, amount, category, user_id } = budget
        const percentageUsed = amount > 0 ? (actualSpending / amount) * 100 : 0

        // Check for warning threshold
        if (percentageUsed >= BUDGET_THRESHOLDS.WARNING && percentageUsed < BUDGET_THRESHOLDS.CRITICAL) {
          const { data: existingAlert } = await supabase
            .from('budget_alerts')
            .select('id')
            .eq('user_id', user_id)
            .eq('budget_id', budget.id)
            .eq('alert_type', BUDGET_ALERT_TYPES.THRESHOLD)
            .eq('is_read', false)
            .single()

          if (!existingAlert) {
            await supabase.from('budget_alerts').insert({
              user_id,
              budget_id: budget.id,
              alert_type: BUDGET_ALERT_TYPES.THRESHOLD,
              message: `Warning: You've used ${percentageUsed.toFixed(1)}% of your ${category} budget.`,
              is_read: false
            })
          }
        }

        // Check for over budget
        if (actualSpending > amount) {
          const { data: existingAlert } = await supabase
            .from('budget_alerts')
            .select('id')
            .eq('user_id', user_id)
            .eq('budget_id', budget.id)
            .eq('alert_type', BUDGET_ALERT_TYPES.OVER_BUDGET)
            .eq('is_read', false)
            .single()

          if (!existingAlert) {
            await supabase.from('budget_alerts').insert({
              user_id,
              budget_id: budget.id,
              alert_type: BUDGET_ALERT_TYPES.OVER_BUDGET,
              message: `Alert: You've exceeded your ${category} budget by $${(actualSpending - amount).toFixed(2)}.`,
              is_read: false
            })
          }
        }
      }
    }

    if (budgets.length > 0) {
      checkBudgetsAndCreateAlerts()
    }
  }, [budgets])
}
