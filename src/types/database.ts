export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          date: string
          description: string | null
          payment_method: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          date: string
          description?: string | null
          payment_method: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          date?: string
          description?: string | null
          payment_method?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          month?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_alerts: {
        Row: {
          id: string
          user_id: string
          budget_id: string | null
          type: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget_id?: string | null
          type: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_id?: string | null
          type?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row']
export type BudgetAlertInsert = Database['public']['Tables']['budget_alerts']['Insert']
