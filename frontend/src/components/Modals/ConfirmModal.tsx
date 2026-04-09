import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title = 'Confirmar exclusão',
  message = 'Tem certeza? Esta ação não pode ser desfeita.',
  confirmLabel = 'Remover',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-rose-400" />

            <div className="p-6">
              {/* Icon + close */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <button
                  onClick={onCancel}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Text */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">{message}</p>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-500/25"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
