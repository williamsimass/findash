import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, TrendingDown, Loader2, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi } from '../../lib/api'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultInstallment?: boolean
}

interface FormData {
  description: string
  amount: string
  category: string
  payment_method: string
  person_name: string
  date: string
  is_installment: boolean
  total_installments: string
  first_due_date: string
}

function nextMonthFirst(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export default function AddExpenseModal({ open, onClose, onSuccess, defaultInstallment }: Props) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date:               new Date().toISOString().slice(0, 10),
      category:           'Alimentação',
      payment_method:     'PIX',
      is_installment:     defaultInstallment ?? false,
      total_installments: '2',
      first_due_date:     nextMonthFirst(),
    },
  })

  const isInstallment = watch('is_installment')
  const amount        = parseFloat(watch('amount')?.replace(',', '.') || '0')
  const nInst         = parseInt(watch('total_installments') || '1')
  const perInst       = isInstallment && nInst > 0 ? amount / nInst : 0

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const parsedAmount = parseFloat(data.amount.replace(',', '.'))
      await transactionsApi.create({
        type:               'expense',
        description:        data.description,
        amount:             parsedAmount,
        category:           data.category,
        payment_method:     data.payment_method || undefined,
        person_name:        data.person_name || undefined,
        date:               new Date(data.date).toISOString(),
        is_installment:     data.is_installment,
        total_installments: data.is_installment ? parseInt(data.total_installments) : undefined,
        first_due_date:     data.is_installment && data.first_due_date
          ? new Date(data.first_due_date).toISOString()
          : undefined,
      })
      toast.success(
        data.is_installment
          ? `Compra parcelada adicionada! ${data.total_installments}x de R$ ${perInst.toFixed(2)}`
          : 'Despesa adicionada!'
      )
      reset()
      onSuccess()
    } catch {
      toast.error('Erro ao adicionar despesa')
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
            className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Despesa</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Registre uma saída de dinheiro</p>
              </div>
              <button onClick={handleClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="label">Descrição</label>
                <input className="input-base" placeholder="Ex: Mercado, Netflix, iPhone..."
                  {...register('description', { required: 'Obrigatório' })} />
                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor total (R$)</label>
                  <input className="input-base" placeholder="0,00"
                    {...register('amount', {
                      required: 'Obrigatório',
                      validate: (v) => !isNaN(parseFloat(v.replace(',', '.'))) || 'Inválido',
                    })} />
                  {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="label">Data da compra</label>
                  <input type="date" className="input-base" {...register('date', { required: true })} />
                </div>
              </div>

              {/* Category + Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoria</label>
                  <select className="input-base" {...register('category', { required: true })}>
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Forma de pagamento</label>
                  <select className="input-base" {...register('payment_method')}>
                    <option value="">Selecione</option>
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Person name (card owner) */}
              <div>
                <label className="label">Dono do cartão <span className="text-slate-400 dark:text-gray-500 font-normal">(opcional)</span></label>
                <input className="input-base" placeholder="Ex: João, Maria, Empresa..."
                  {...register('person_name')} />
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                  Útil para identificar de qual cartão é a compra
                </p>
              </div>

              {/* Installment toggle */}
              <div className={cn(
                'rounded-xl border-2 p-4 transition-all cursor-pointer',
                isInstallment
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-slate-200 dark:border-gray-700'
              )}>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-brand-500"
                    {...register('is_installment')}
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className={cn('w-4 h-4', isInstallment ? 'text-brand-500' : 'text-slate-400')} />
                    <span className={cn(
                      'font-semibold text-sm',
                      isInstallment ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-gray-300'
                    )}>
                      Compra parcelada
                    </span>
                  </div>
                </label>

                {/* Installment options */}
                <AnimatePresence>
                  {isInstallment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Nº de parcelas</label>
                          <select
                            className="input-base"
                            {...register('total_installments', { required: isInstallment })}
                          >
                            {Array.from({ length: 23 }, (_, i) => i + 2).map((n) => (
                              <option key={n} value={n}>{n}x</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">1º vencimento</label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              className="input-base pl-9"
                              {...register('first_due_date', { required: isInstallment })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      {amount > 0 && nInst > 0 && (
                        <div className="bg-brand-500/10 rounded-xl p-3 text-center">
                          <p className="text-brand-600 dark:text-brand-400 font-bold text-lg">
                            {nInst}x de R$ {perInst.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-brand-500/70 mt-0.5">
                            Total: R$ {amount.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
                  {loading ? 'Salvando...' : isInstallment ? 'Parcelar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
