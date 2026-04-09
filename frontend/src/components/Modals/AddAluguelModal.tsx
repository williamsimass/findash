import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Loader2, CalendarDays, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsApi } from '../../lib/api'
import { PAYMENT_METHODS } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  description: string
  monthly_amount: string
  payment_method: string
  person_name: string
  first_due_date: string
}

function firstOfCurrentMonth(): string {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

// Gera 60 meses (5 anos) — suficiente para qualquer aluguel recorrente
const RECURRING_MONTHS = 60

export default function AddAluguelModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      payment_method: 'PIX',
      first_due_date: firstOfCurrentMonth(),
    },
  })

  const monthly = parseFloat(watch('monthly_amount')?.replace(',', '.') || '0')

  function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const monthlyValue = parseFloat(data.monthly_amount.replace(',', '.'))
      await transactionsApi.create({
        type: 'expense',
        description: data.description,
        amount: monthlyValue * RECURRING_MONTHS,
        category: 'Aluguel',
        payment_method: data.payment_method || undefined,
        person_name: data.person_name || undefined,
        date: new Date(data.first_due_date).toISOString(),
        is_installment: true,
        is_recurring: true,
        total_installments: RECURRING_MONTHS,
        first_due_date: new Date(data.first_due_date).toISOString(),
      })
      toast.success(`Aluguel recorrente adicionado! ${formatBRL(monthlyValue)}/mês`)
      reset()
      onSuccess()
    } catch {
      toast.error('Erro ao adicionar aluguel')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() { reset(); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aluguel Recorrente</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Cobrança automática todo mês — marque como pago quando pagar</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Recurring badge */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20">
                <RefreshCw className="w-4 h-4 text-orange-500 shrink-0" />
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Recorrência mensal automática · aparece todo mês na aba <strong>Parcelas</strong> para marcar como pago
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="label">Descrição</label>
                <input className="input-base" placeholder="Ex: Aluguel Apartamento, Aluguel Sala..."
                  {...register('description', { required: 'Obrigatório' })} />
                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Amount + first due */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor mensal (R$)</label>
                  <input className="input-base" placeholder="0,00"
                    {...register('monthly_amount', {
                      required: 'Obrigatório',
                      validate: (v) => !isNaN(parseFloat(v.replace(',', '.'))) || 'Inválido',
                    })} />
                  {errors.monthly_amount && <p className="text-xs text-rose-500 mt-1">{errors.monthly_amount.message}</p>}
                </div>
                <div>
                  <label className="label">1º vencimento</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" className="input-base pl-9"
                      {...register('first_due_date', { required: true })} />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="label">Forma de pagamento</label>
                <select className="input-base" {...register('payment_method')}>
                  <option value="">Selecione</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Person name */}
              <div>
                <label className="label">Proprietário / Referência <span className="text-slate-400 font-normal">(opcional)</span></label>
                <input className="input-base" placeholder="Ex: João Silva, Imobiliária..."
                  {...register('person_name')} />
              </div>

              {/* Preview */}
              {monthly > 0 && (
                <div className="bg-orange-500/10 rounded-xl p-4 text-center space-y-1">
                  <p className="text-orange-600 dark:text-orange-400 font-bold text-xl">{formatBRL(monthly)}<span className="text-sm font-normal">/mês</span></p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">Recorrência por 60 meses · todo mês aparece para confirmar pagamento</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {loading ? 'Salvando...' : 'Ativar Recorrência'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
