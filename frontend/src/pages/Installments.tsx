import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, Plus,
  ChevronDown, ChevronUp, RefreshCw, Home,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi, installmentsApi } from '../lib/api'
import { formatCurrency, formatMonthYear, isSameMonth, isOverdue } from '../lib/utils'
import { cn } from '../lib/utils'
import AddExpenseModal from '../components/Modals/AddExpenseModal'
import AddAluguelModal from '../components/Modals/AddAluguelModal'
import type { Transaction, Installment } from '../types'

export default function Installments() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd]         = useState(false)
  const [showAluguel, setShowAluguel] = useState(false)
  const [expanded, setExpanded]       = useState<number | null>(null)
  const [loadingId, setLoadingId]     = useState<number | null>(null)

  const { data: allInstallments = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['installmentTransactions'],
    queryFn: () =>
      transactionsApi.list({ type: 'expense', is_installment: true, limit: 200 }).then((r) => r.data),
    refetchInterval: 30_000,
  })

  const recurring   = allInstallments.filter((t) => t.is_recurring)
  const installment = allInstallments.filter((t) => !t.is_recurring)

  // Stats — for recurring, only count the current month's installment (not all 60 future ones)
  const now = new Date()
  const totalPending = allInstallments.reduce((sum, t) => {
    if (t.is_recurring) {
      const curInst = t.installments.find((i) => {
        const d = new Date(i.due_date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      return sum + (curInst && !curInst.is_paid ? curInst.amount : 0)
    }
    return sum + t.installments.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0)
  }, 0)
  const totalPaid = allInstallments.reduce((sum, t) =>
    sum + t.installments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0), 0)

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['installmentTransactions'] })
    qc.invalidateQueries({ queryKey: ['summary'] })
  }

  async function togglePaid(inst: Installment) {
    setLoadingId(inst.id)
    try {
      if (inst.is_paid) {
        await installmentsApi.unpay(inst.id)
        toast.success('Desmarcado')
      } else {
        await installmentsApi.pay(inst.id)
        toast.success('Pago! ✅')
      }
      invalidate()
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setLoadingId(null)
    }
  }

  function getStatus(inst: Installment) {
    if (inst.is_paid) return 'paid'
    if (isSameMonth(inst.due_date)) return 'current'
    if (isOverdue(inst.due_date)) return 'overdue'
    return 'pending'
  }

  // Find the current month's installment for a recurring transaction
  function currentMonthInst(t: Transaction): Installment | undefined {
    const now = new Date()
    return t.installments.find((i) => {
      const d = new Date(i.due_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Parcelas & Recorrências</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Compras parceladas e pagamentos recorrentes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAluguel(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
            <Home className="w-4 h-4" /> Aluguel
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 btn-primary">
            <Plus className="w-4 h-4" /> Nova parcela
          </button>
        </div>
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

      {/* ── RECORRENTES ──────────────────────────────────────────── */}
      {!isLoading && recurring.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              Recorrentes — {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {recurring.map((t, ti) => {
                const inst = currentMonthInst(t)
                const isPaid = inst?.is_paid ?? false

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ti * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 transition-colors',
                      isPaid
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/5'
                        : 'hover:bg-slate-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                      isPaid ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                    )}>
                      {isPaid
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        : <Home className="w-5 h-5 text-orange-500" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.description}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" /> Recorrente
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {t.person_name && (
                          <span className="text-xs text-slate-400 dark:text-gray-500">{t.person_name}</span>
                        )}
                        {t.payment_method && (
                          <span className="text-xs text-slate-400 dark:text-gray-500">· {t.payment_method}</span>
                        )}
                        {!inst && (
                          <span className="text-xs text-slate-400 dark:text-gray-500 italic">sem vencimento este mês</span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className={cn('font-bold text-base', isPaid ? 'text-emerald-500' : 'text-rose-500')}>
                        {inst ? formatCurrency(inst.amount) : formatCurrency(t.amount / (t.total_installments ?? 60))}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">por mês</p>
                    </div>

                    {/* Pay button */}
                    {inst && (
                      <button
                        onClick={() => togglePaid(inst)}
                        disabled={loadingId === inst.id}
                        className={cn(
                          'shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50',
                          isPaid
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                        )}
                      >
                        {loadingId === inst.id ? '...' : isPaid ? 'Pago ✓' : 'Pagar'}
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PARCELADAS ───────────────────────────────────────────── */}
      {!isLoading && (
        <section className="space-y-3">
          {recurring.length > 0 && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
                Compras Parceladas
              </h3>
            </div>
          )}

          {installment.length === 0 && recurring.length === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7 text-slate-400 dark:text-gray-500" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-gray-300">Nenhuma parcela</p>
              <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">
                Adicione uma compra parcelada ou aluguel recorrente.
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAluguel(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
                  <Home className="w-4 h-4" /> Aluguel
                </button>
                <button onClick={() => setShowAdd(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Parcelas
                </button>
              </div>
            </div>
          ) : installment.length === 0 ? null : (
            <div className="space-y-4">
              {installment.map((t, ti) => {
                const paidCount  = t.installments.filter((i) => i.is_paid).length
                const totalInst  = t.installments.length
                const paidPct    = totalInst > 0 ? (paidCount / totalInst) * 100 : 0
                const pendingAmt = t.installments.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0)
                const isOpen     = expanded === t.id

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ti * 0.05 }}
                    className="card overflow-hidden"
                  >
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
                            <span className={cn('text-xs font-semibold',
                              paidCount === totalInst ? 'text-emerald-500' : 'text-amber-500'
                            )}>
                              {paidCount}/{totalInst} pagas
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${paidPct}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-amber-500">{formatCurrency(pendingAmt)}</p>
                          <p className="text-xs text-slate-400 dark:text-gray-500">a pagar</p>
                          <div className="mt-2 flex justify-end">
                            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100 dark:border-gray-800"
                      >
                        <div className="divide-y divide-slate-100 dark:divide-gray-800">
                          {t.installments
                            .slice().sort((a, b) => a.installment_number - b.installment_number)
                            .map((inst) => {
                              const status = getStatus(inst)
                              return (
                                <div key={inst.id} className={cn(
                                  'flex items-center gap-4 px-5 py-3 transition-colors',
                                  status === 'current' && !inst.is_paid
                                    ? 'bg-amber-50 dark:bg-amber-500/5'
                                    : 'hover:bg-slate-50 dark:hover:bg-gray-800/30'
                                )}>
                                  <div className="shrink-0">
                                    {status === 'paid' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                      : status === 'overdue' ? <AlertCircle className="w-5 h-5 text-rose-500" />
                                      : status === 'current' ? <Clock className="w-5 h-5 text-amber-500" />
                                      : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-gray-600" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                      Parcela {inst.installment_number}/{totalInst}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-xs text-slate-400 dark:text-gray-500">Venc: {formatMonthYear(inst.due_date)}</p>
                                      {status === 'current' && !inst.is_paid && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold">Este mês</span>
                                      )}
                                      {status === 'overdue' && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-semibold">Atrasada</span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold text-slate-700 dark:text-gray-300 shrink-0">{formatCurrency(inst.amount)}</p>
                                  <button
                                    onClick={() => togglePaid(inst)}
                                    disabled={loadingId === inst.id}
                                    className={cn(
                                      'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50',
                                      inst.is_paid
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
                                        : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-brand-500 hover:text-white'
                                    )}
                                  >
                                    {loadingId === inst.id ? '...' : inst.is_paid ? 'Pago ✓' : 'Pagar'}
                                  </button>
                                </div>
                              )
                            })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>
      )}

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} defaultInstallment
        onSuccess={() => { invalidate(); setShowAdd(false) }} />
      <AddAluguelModal open={showAluguel} onClose={() => setShowAluguel(false)}
        onSuccess={() => { invalidate(); setShowAluguel(false) }} />
    </div>
  )
}
