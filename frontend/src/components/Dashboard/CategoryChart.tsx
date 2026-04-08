import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../../lib/utils'
import type { CategoryData } from '../../types'
import { CATEGORY_COLORS } from '../../types'

interface Props { data: CategoryData[] }

const COLORS = [
  '#10B981','#3B82F6','#F59E0B','#8B5CF6','#EC4899',
  '#14B8A6','#F97316','#6366F1','#EF4444','#06B6D4','#64748B',
]

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-700 dark:text-gray-200">{p.name}</p>
      <p className="text-slate-500 dark:text-gray-400">{formatCurrency(p.value)}</p>
    </div>
  )
}

export default function CategoryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center h-full min-h-[250px]">
        <p className="text-slate-400 dark:text-gray-500 text-sm">Sem dados de categorias neste mês</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
        Gastos por Categoria
        <span className="ml-2 text-xs font-normal text-slate-400 dark:text-gray-500">(mês atual)</span>
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] || COLORS[i % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => (
              <span className="text-xs text-slate-600 dark:text-gray-400">{v}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
