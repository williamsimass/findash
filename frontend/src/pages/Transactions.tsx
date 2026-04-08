import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, ArrowUpRight, ArrowDownRight, CreditCard,
  Trash2, Filter, TrendingUp, TrendingDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import AddIncomeModal from '../components/Modals/AddIncomeModal'
import AddExpenseModal from '../components/Modals/AddExpenseModal'
import type { Transaction } from '../types'
import { EXPENSE_CATEGORIES } from '../types'

type TypeFilter = 'all' | 'income' | 'expense'

export default function Transactions() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [catFilter, setCatFilter] = useState('')
  const [showIncome, setShowIncome]   = useState(false)
  const [showExpense, setShowExpense] = useState(false)

  const params: Record<string, unknown> = { limit: 100 }
  if (typeFilter !== 'all') params.type = typeFilter
  if (catFilter) params.category = catFilter

  const { data: raw = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', typeFilter, catFilter],
    queryFn: () => transactionsApi.list(params).then((r) => r.data),
    refetchInterval: 30_000,
  })

  const transactions = raw.filter((t) =>
    !search || t.description.toLowerCase().includes(search.toLowerCase()) ||
    (t.person_name?.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleDelete(id: number) {
    if (!confirm('Remover esta transação?')) return
    try {
      await transactionsApi.delete(id)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
      toast.success('Transação removida')
    } catch {
      toast.error('Erro ao remover')
    }
  }

  function onSuccess() {
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['summary'] })
    qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
          <input
            className="input-base pl-9"
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="flex bg-slate-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {(['all', 'income', 'expense'] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                typeFilter === t
                  ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
              )}
            >
              {t === 'all' ? 'Todos' : t === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Add buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowIncome(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> Receita
          </button>
          <button
            onClick={() => setShowExpense(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            <TrendingDown className="w-4 h-4" /> Despesa
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            !catFilter
              ? 'bg-brand-500 text-white'
              : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
          )}
        >
          Todas
        </button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(catFilter === c ? '' : c)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              catFilter === c
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 dark:text-gray-400">
        {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'}
      </p>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <Filter className="w-10 h-10 text-slate-300 dark:text-gray-600 mb-3" />
          <p className="font-medium text-slate-600 dark:text-gray-400">Nenhuma transação encontrada</p>
          <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">
            Tente mudar os filtros ou adicione uma nova transação.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <AnimatePresence>
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {transactions.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    t.type === 'income' ? 'bg-emerald-500/10'
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

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        t.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {t.category}
                      </span>
                      {t.person_name && (
                        <span className="text-xs text-blue-500">💳 {t.person_name}</span>
                      )}
                      {t.payment_method && (
                        <span className="text-xs text-slate-400 dark:text-gray-500">{t.payment_method}</span>
                      )}
                      {t.is_installment && t.total_installments && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                          {t.total_installments}x de {formatCurrency(t.amount / t.total_installments)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + Date */}
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-sm font-bold',
                      t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">{formatDate(t.date)}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 dark:text-gray-600 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      <AddIncomeModal
        open={showIncome}
        onClose={() => setShowIncome(false)}
        onSuccess={() => { onSuccess(); setShowIncome(false) }}
      />
      <AddExpenseModal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        onSuccess={() => { onSuccess(); setShowExpense(false) }}
      />
    </div>
  )
}
