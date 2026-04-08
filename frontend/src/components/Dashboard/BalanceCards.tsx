import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import type { BalanceSummary } from '../../types'
import { cn } from '../../lib/utils'

interface Props { summary: BalanceSummary; loading?: boolean }

const CARDS = (s: BalanceSummary) => [
  {
    label:    'Saldo Total',
    value:    s.balance,
    icon:     Wallet,
    color:    s.balance >= 0 ? 'text-brand-500' : 'text-rose-500',
    bg:       s.balance >= 0 ? 'bg-brand-500/10' : 'bg-rose-500/10',
    border:   s.balance >= 0 ? 'border-brand-500/20' : 'border-rose-500/20',
    trend:    null,
  },
  {
    label:    'Total Recebido',
    value:    s.total_income,
    icon:     TrendingUp,
    color:    'text-emerald-500',
    bg:       'bg-emerald-500/10',
    border:   'border-emerald-500/20',
    trend:    null,
  },
  {
    label:    'Total Gasto',
    value:    s.paid_amount,
    icon:     TrendingDown,
    color:    'text-rose-500',
    bg:       'bg-rose-500/10',
    border:   'border-rose-500/20',
    trend:    null,
  },
  {
    label:    'A Pagar',
    value:    s.pending_installments,
    icon:     Clock,
    color:    'text-amber-500',
    bg:       'bg-amber-500/10',
    border:   'border-amber-500/20',
    trend:    null,
  },
]

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-gray-700" />
        <div className="h-4 w-28 bg-slate-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="h-8 w-36 bg-slate-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}

export default function BalanceCards({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS(summary).map(({ label, value, icon: Icon, color, bg, border }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={cn('card p-5 border', border)}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{label}</p>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
          </div>
          <p className={cn('text-2xl font-bold', color)}>
            {formatCurrency(value)}
          </p>
          {label === 'Saldo Total' && (
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              Disponível: {formatCurrency(summary.available)}
            </p>
          )}
          {label === 'Total Gasto' && summary.total_expenses > 0 && (
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              Comprometido: {formatCurrency(summary.total_expenses)}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
