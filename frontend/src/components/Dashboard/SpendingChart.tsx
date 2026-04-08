import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../../lib/utils'
import type { MonthlyData } from '../../types'
import { useTheme } from '../../context/ThemeContext'

interface Props { data: MonthlyData[] }

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-gray-400">{p.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SpendingChart({ data }: Props) {
  const { theme } = useTheme()
  const gridColor = theme === 'dark' ? '#374151' : '#E2E8F0'
  const textColor = theme === 'dark' ? '#9CA3AF' : '#64748B'

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
        Evolução Mensal
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(v) => <span style={{ color: textColor }}>{v}</span>}
          />
          <Bar dataKey="income"   name="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="Despesas" fill="#F43F5E" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
