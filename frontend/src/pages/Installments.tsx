import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, Clock, AlertCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi, installmentsApi } from '../lib/api'
import { formatCurrency, formatMonthYear, isSameMonth, isOverdue } from '../lib/utils'
import { cn } from '../lib/utils'
import AddExpenseModal from '../components/Modals/AddExpenseModal'
import type { Transaction, Installment } from '../types'

export default function Installments() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['installmentTransactions'],
    queryFn: () =>
      transactionsApi.list({ type: 'expense', is_installment: true, limit: 100 }).then((r) => r.data),
    refetchInterval: 30_000,
  })

  // Summary stats
  const totalPending = transactions.reduce((sum, t) => {
    const pending = t.installments.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0)
    return sum + pending
  }, 0)

  const totalPaid = transactions.reduce((sum, t) => {
    const paid = t.installments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0)
    return sum + paid
  }, 0)

  async function togglePaid(inst: Installment) {
    setLoadingId(inst.id)
    try {
      if (inst.is_paid) {
        await installmentsApi.unpay(inst.id)
        toast.success('Parcela desmarcada')
      } else {
        await installmentsApi.pay(inst.id)
        toast.success('Parcela marcada como paga! ✅')
      }
      qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    } catch {
      toast.error('Erro ao atualizar parcela')
    } finally {
      setLoadingId(null)
    }
  }

  function getInstallmentStatus(inst: Installment) {
    if (inst.is_paid) return 'paid'
    if (isSameMonth(inst.due_date)) return 'current'
    if (isOverdue(inst.due_date)) return 'overdue'
    return 'pending'
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Parcelas do Cartão
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            Gerencie suas compras parceladas
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nova compra parcelada
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 border border-amber-500/20">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">A Pagar</p>
          <p className="text-xl font-bold text-amber-500">{formatCurrency(totalPending)}</p>
        </div>
        <div className="card p-4 border border-emerald-500/20">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">Já Pago</p>
          <p className="text-xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 w-48 bg-slate-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && transactions.length === 0 && (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-slate-400 dark:text-gray-500" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-gray-300">Nenhuma compra parcelada</p>
          <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">
            Adicione uma compra parcelada para controlar suas parcelas.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Adicionar parcelas
          </button>
        </div>
      )}

      {/* Transaction cards */}
      <div className="space-y-4">
        {transactions.map((t, ti) => {
          const paidCount   = t.installments.filter((i) => i.is_paid).length
          const totalInst   = t.installments.length
          const paidPct     = totalInst > 0 ? (paidCount / totalInst) * 100 : 0
          const pendingAmt  = t.installments.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0)
          const isOpen      = expanded === t.id

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ti * 0.05 }}
              className="card overflow-hidden"
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isOpen ? null : t.id)}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 dark:text-white">{t.description}</p>
                      {t.person_name && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                          💳 {t.person_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
                        {formatCurrency(t.amount)} total
                      </span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">
                        {totalInst}x de {formatCurrency(t.amount / (totalInst || 1))}
                      </span>
                      <span className={cn(
                        'text-xs font-semibold',
                        paidCount === totalInst ? 'text-emerald-500' : 'text-amber-500'
                      )}>
                        {paidCount}/{totalInst} pagas
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-500">
                      {formatCurrency(pendingAmt)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">a pagar</p>
                    <div className="mt-2 flex justify-end">
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </div>
                </div>
              </button>

              {/* Installments list */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-100 dark:border-gray-800"
                >
                  <div className="divide-y divide-slate-100 dark:divide-gray-800">
                    {t.installments
                      .slice()
                      .sort((a, b) => a.installment_number - b.installment_number)
                      .map((inst) => {
                        const status = getInstallmentStatus(inst)
                        return (
                          <div
                            key={inst.id}
                            className={cn(
                              'flex items-center gap-4 px-5 py-3 transition-colors',
                              status === 'current' && !inst.is_paid
                                ? 'bg-amber-50 dark:bg-amber-500/5'
                                : 'hover:bg-slate-50 dark:hover:bg-gray-800/30'
                            )}
                          >
                            {/* Status icon */}
                            <div className="shrink-0">
                              {status === 'paid' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : status === 'overdue' ? (
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                              ) : status === 'current' ? (
                                <Clock className="w-5 h-5 text-amber-500" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-gray-600" />
                              )}
                            </div>

                            {/* Installment info */}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                Parcela {inst.installment_number}/{totalInst}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-400 dark:text-gray-500">
                                  Venc: {formatMonthYear(inst.due_date)}
                                </p>
                                {status === 'current' && !inst.is_paid && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold">
                                    Este mês
                                  </span>
                                )}
                                {status === 'overdue' && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-semibold">
                                    Atrasada
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Amount */}
                            <p className="text-sm font-bold text-slate-700 dark:text-gray-300 shrink-0">
                              {formatCurrency(inst.amount)}
                            </p>

                            {/* Toggle button */}
                            <button
                              onClick={() => togglePaid(inst)}
                              disabled={loadingId === inst.id}
                              className={cn(
                                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                inst.is_paid
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
                                  : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-brand-500 hover:text-white',
                                loadingId === inst.id && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {loadingId === inst.id ? '...' : inst.is_paid ? 'Pago ✓' : 'Pagar'}
                            </button>
                          </div>
                        )
                      })
                    }
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        defaultInstallment
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
          qc.invalidateQueries({ queryKey: ['summary'] })
          qc.invalidateQueries({ queryKey: ['transactions'] })
          setShowAdd(false)
        }}
      />
    </div>
  )
}
