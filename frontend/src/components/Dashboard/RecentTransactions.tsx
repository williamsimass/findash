import { ArrowUpRight, ArrowDownRight, CreditCard, Trash2, ArrowLeftRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { Transaction } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  transactions: Transaction[]
  onDelete: (id: number) => void
}

export default function RecentTransactions({ transactions, onDelete }: Props) {
  if (!transactions.length) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <ArrowLeftRight className="w-6 h-6 text-slate-400 dark:text-gray-500" />
        </div>
        <p className="font-medium text-slate-600 dark:text-gray-400">Nenhuma transação ainda</p>
        <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">
          Adicione receitas ou despesas para começar
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Transações Recentes
        </h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-gray-800">
        {transactions.slice(0, 8).map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors group"
          >
            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              t.type === 'income'
                ? 'bg-emerald-500/10'
                : t.is_installment ? 'bg-blue-500/10' : 'bg-rose-500/10'
            )}>
              {t.type === 'income' ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              ) : t.is_installment ? (
                <CreditCard className="w-5 h-5 text-blue-500" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-rose-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {t.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 dark:text-gray-500">{t.category}</span>
                {t.person_name && (
                  <>
                    <span className="text-slate-300 dark:text-gray-700">•</span>
                    <span className="text-xs text-blue-500">{t.person_name}</span>
                  </>
                )}
                {t.is_recurring ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 font-medium">
                    Recorrente
                  </span>
                ) : t.is_installment && t.total_installments ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-medium">
                    {t.total_installments}x
                  </span>
                ) : null}
              </div>
            </div>

            {/* Amount + date */}
            <div className="text-right shrink-0">
              <p className={cn(
                'text-sm font-bold',
                t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
              )}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(
                  t.is_recurring && t.total_installments
                    ? t.amount / t.total_installments
                    : t.amount
                )}{t.is_recurring && <span className="text-xs font-normal opacity-60">/mês</span>}
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                {formatDate(t.date)}
              </p>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(t.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 dark:text-gray-600 hover:text-rose-500 transition-all ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

