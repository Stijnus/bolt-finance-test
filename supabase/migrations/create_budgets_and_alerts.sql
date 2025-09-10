/*
  # Create budgets and budget alerts tables
  
  1. New Tables:
    - budgets (id, user_id, amount, category, month, timestamps)
    - budget_alerts (id, user_id, budget_id, type, message, is_read, timestamps)
  
  2. Security:
    - Enable RLS on both tables
    - Policies for users to manage their own budgets and alerts
    - Policies for reading and writing budget alerts
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount >= 0),
  category text NOT NULL,
  month text NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month)
);

-- Create budget_alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  budget_id uuid REFERENCES budgets(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('threshold', 'over_budget', 'monthly_summary')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Budgets policies
CREATE POLICY "Users can manage their own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Budget alerts policies
CREATE POLICY "Users can manage their own budget alerts"
  ON budget_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own budget alerts"
  ON budget_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON budget_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_is_read ON budget_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created_at ON budget_alerts(created_at DESC);
