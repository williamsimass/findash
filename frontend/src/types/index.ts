export interface User {
  id: number
  username: string
  email: string
  full_name: string
  avatar_icon: string
  theme: 'dark' | 'light'
  created_at: string
}

export interface Installment {
  id: number
  transaction_id: number
  installment_number: number
  amount: number
  due_date: string
  is_paid: boolean
  paid_at: string | null
}

export interface Transaction {
  id: number
  user_id: number
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  payment_method: string | null
  person_name: string | null
  date: string
  is_installment: boolean
  total_installments: number | null
  created_at: string
  installments: Installment[]
}

export interface MonthlyData {
  month: string
  year: number
  income: number
  expenses: number
}

export interface CategoryData {
  category: string
  amount: number
}

export interface BalanceSummary {
  total_income: number
  total_expenses: number
  paid_amount: number
  pending_installments: number
  balance: number
  available: number
  monthly_data: MonthlyData[]
  category_data: CategoryData[]
}

export interface CreateTransactionDto {
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  payment_method?: string
  person_name?: string
  date: string
  is_installment?: boolean
  total_installments?: number
  first_due_date?: string
}

export const INCOME_CATEGORIES = [
  'Salário', 'Freelance', 'Investimentos', 'Bônus', 'Aluguel recebido', 'Outros'
]

export const EXPENSE_CATEGORIES = [
  'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer',
  'Casa', 'Aluguel', 'Vestuário', 'Tecnologia', 'Cartão de Crédito', 'Assinaturas', 'Outros'
]

export const PAYMENT_METHODS = [
  'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Transferência', 'Boleto'
]

export const AVATAR_ICONS = [
  '👤', '😀', '😎', '🤩', '🥳', '🧑‍💼', '👨‍💻', '👩‍💻',
  '🦁', '🐯', '🦊', '🐻', '🐼', '🦄', '🐲', '🦅',
  '🚀', '💎', '🌟', '🔥', '⚡', '🎯', '💡', '🌈',
]

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação:        '#10B981',
  Transporte:         '#3B82F6',
  Saúde:              '#F59E0B',
  Educação:           '#8B5CF6',
  Lazer:              '#EC4899',
  Casa:               '#14B8A6',
  Aluguel:            '#F97316',
  Vestuário:          '#F97316',
  Tecnologia:         '#6366F1',
  'Cartão de Crédito':'#EF4444',
  Assinaturas:        '#06B6D4',
  Outros:             '#64748B',
  Salário:            '#10B981',
  Freelance:          '#22C55E',
  Investimentos:      '#A855F7',
  Bônus:              '#F59E0B',
  'Aluguel recebido': '#0EA5E9',
}
