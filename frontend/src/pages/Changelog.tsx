import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export const CURRENT_VERSION = '0.0.3'
export const CHANGELOG_SEEN_KEY = 'changelog_seen_version'

const RELEASES = [
  {
    version: '0.0.3',
    date: 'Abril 2026',
    label: 'Melhoria',
    items: [
      'Aluguel recorrente agora exibe o valor mensal (ex: R$ 900,00/mês) em vez do total acumulado das parcelas ',
      'Badge de parcelas substituído por "Recorrente" em transações de aluguel — identidade visual mais clara e intuitiva',
      'Ajuste no card de transações recentes e na lista de transações: ambos respeitam o custo mensal real para recorrências',
    ],
  },
  {
    version: '0.0.2',
    date: 'Abril 2026',
    label: 'Atualização',
    items: [
      'Confirmação de exclusão agora usa modal estilizado — sem aquele popup feio do navegador',
      'Aluguel agora é verdadeiramente recorrente: aparece todo mês na aba Parcelas para marcar como Pago',
      'Aba Parcelas dividida em duas seções: Recorrentes (mês atual em destaque) e Compras Parceladas',
      'Botão direto de Pagar/Pago para cada recorrência mensal sem precisar expandir listas',
    ],
  },
  {
    version: '0.0.1',
    date: 'Abril 2026',
    label: 'Lançamento',
    items: [
      'Adicionado botão de editar a despesa e receita (categoria e forma de pagamento)',
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Versão {release.version}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-semibold">{release.label}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500">{release.date}</p>
              </div>
            </div>
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
