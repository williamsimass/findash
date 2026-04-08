import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi } from '../../lib/api'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../types'
import type { Transaction } from '../../types'

interface Props {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  category: string
  payment_method: string
}

export default function EditTransactionModal({ open, transaction, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const isIncome = transaction?.type === 'income'
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const { register, handleSubmit, reset } = useForm<FormData>({
    values: {
      category: transaction?.category ?? '',
      payment_method: transaction?.payment_method ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    if (!transaction) return
    setLoading(true)
    try {
      await transactionsApi.update(transaction.id, {
        category: data.category || undefined,
        payment_method: data.payment_method || undefined,
      })
      toast.success('Transação atualizada!')
      onSuccess()
    } catch {
      toast.error('Erro ao atualizar transação')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    reset()
    onClose()
  }

  const accentColor = isIncome ? 'emerald' : 'rose'

  return (
    <AnimatePresence>
      {open && transaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-gray-800">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <Pencil className={`w-5 h-5 ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Editar {isIncome ? 'Receita' : 'Despesa'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{transaction.description}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="label">Categoria</label>
                <select className="input-base" {...register('category', { required: true })}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Payment method (only for expense) */}
              {!isIncome && (
                <div>
                  <label className="label">Forma de pagamento</label>
                  <select className="input-base" {...register('payment_method')}>
                    <option value="">Nenhuma</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 ${
                    isIncome
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
