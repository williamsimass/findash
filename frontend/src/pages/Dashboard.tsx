import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { transactionsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import BalanceCards from '../components/Dashboard/BalanceCards'
import SpendingChart from '../components/Dashboard/SpendingChart'
import CategoryChart from '../components/Dashboard/CategoryChart'
import RecentTransactions from '../components/Dashboard/RecentTransactions'
import AddIncomeModal from '../components/Modals/AddIncomeModal'
import AddExpenseModal from '../components/Modals/AddExpenseModal'
import ConfirmModal from '../components/Modals/ConfirmModal'
import type { BalanceSummary, Transaction } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showIncome, setShowIncome]   = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [deleteId, setDeleteId]       = useState<number | null>(null)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite'
  const dateLabel = format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const { data: summary, isLoading: loadingSummary } = useQuery<BalanceSummary>({
    queryKey: ['summary'],
    queryFn: () => transactionsApi.summary().then((r) => r.data),
    refetchInterval: 30_000,
  })

  const { data: transactions = [], isLoading: loadingTxns } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list({ limit: 20 }).then((r) => r.data),
    refetchInterval: 30_000,
  })

  async function handleDelete(id: number) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (deleteId === null) return
    try {
      await transactionsApi.delete(deleteId)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      toast.success('Transação removida')
    } catch {
      toast.error('Erro ao remover')
    } finally {
      setDeleteId(null)
    }
  }

  const emptySummary: BalanceSummary = {
    total_income: 0, total_expenses: 0, paid_amount: 0,
    pending_installments: 0, balance: 0, available: 0,
    monthly_data: [], category_data: [],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.full_name?.split(' ')[0]}! {user?.avatar_icon}
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5 capitalize">{dateLabel}</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowIncome(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/25"
          >
            <TrendingUp className="w-4 h-4" />
            Receita
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowExpense(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-rose-500/25"
          >
            <TrendingDown className="w-4 h-4" />
            Despesa
          </motion.button>
        </div>
      </div>

      {/* Balance cards */}
      <BalanceCards
        summary={summary ?? emptySummary}
        loading={loadingSummary}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SpendingChart data={summary?.monthly_data ?? []} />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart data={summary?.category_data ?? []} />
        </div>
      </div>

      {/* Recent transactions */}
      {!loadingTxns && (
        <RecentTransactions transactions={transactions} onDelete={handleDelete} />
      )}

      <ConfirmModal
        open={deleteId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modals */}
      <AddIncomeModal
        open={showIncome}
        onClose={() => setShowIncome(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['transactions'] })
          qc.invalidateQueries({ queryKey: ['summary'] })
          setShowIncome(false)
        }}
      />
      <AddExpenseModal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['transactions'] })
          qc.invalidateQueries({ queryKey: ['summary'] })
          qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
          setShowExpense(false)
        }}
      />

      {/* Floating add button (mobile) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 lg:hidden z-30">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExpense(true)}
          className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-xl flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
