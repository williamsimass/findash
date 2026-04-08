import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi } from '../../lib/api'
import { INCOME_CATEGORIES } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  description: string
  amount: string
  category: string
  date: string
}

export default function AddIncomeModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: 'Salário',
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await transactionsApi.create({
        type: 'income',
        description: data.description,
        amount: parseFloat(data.amount.replace(',', '.')),
        category: data.category,
        date: new Date(data.date).toISOString(),
      })
      toast.success('Receita adicionada! 💰')
      reset()
      onSuccess()
    } catch {
      toast.error('Erro ao adicionar receita')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Receita</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Registre um valor recebido</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Descrição</label>
                <input
                  className="input-base"
                  placeholder="Ex: Salário de maio"
                  {...register('description', { required: 'Obrigatório' })}
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor (R$)</label>
                  <input
                    className="input-base"
                    placeholder="0,00"
                    {...register('amount', {
                      required: 'Obrigatório',
                      validate: (v) => !isNaN(parseFloat(v.replace(',', '.'))) || 'Valor inválido',
                    })}
                  />
                  {errors.amount && (
                    <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Data</label>
                  <input
                    type="date"
                    className="input-base"
                    {...register('date', { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Categoria</label>
                <select className="input-base" {...register('category', { required: true })}>
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {loading ? 'Salvando...' : 'Adicionar receita'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
