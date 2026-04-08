import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export const CURRENT_VERSION = '0.0.1'
export const CHANGELOG_SEEN_KEY = 'changelog_seen_version'

const RELEASES = [
  {
    version: '0.0.1',
    date: 'Abril 2026',
    label: 'Lançamento',
    items: [
      'Adicionado botão de editar a despesa (categoria e forma de pagamento)',
      'Adicionada aba de Contato para entrar em contato com o desenvolvedor via WhatsApp',
      'Adicionada aba de Notas de Atualização — fique ligado nas novidades!',
      'Adicionada opção de Aluguel em Transações: despesa recorrente mensal com controle de pagamento mês a mês',
    ],
  },
]

export default function Changelog() {
  useEffect(() => {
    localStorage.setItem(CHANGELOG_SEEN_KEY, CURRENT_VERSION)
    window.dispatchEvent(new Event('changelog-seen'))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          Notas de Atualização
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
          Acompanhe as novidades e melhorias do FinDash.
        </p>
      </div>

      <div className="space-y-5">
        {RELEASES.map((release, ri) => (
          <motion.div
            key={release.version}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ri * 0.08 }}
            className="card p-5"
          >
            {/* Version header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Versão {release.version}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-semibold">
                    {release.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500">{release.date}</p>
              </div>
            </div>

            {/* Items */}
            <ul className="space-y-2.5">
              {release.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
