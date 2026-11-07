import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ArrowUpRight } from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

/**
 * Custom dark tooltip for Recharts cash flow visualization
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === 'income')?.value || 0
    const expenses = payload.find((p) => p.dataKey === 'expenses')?.value || 0
    const savings = income - expenses

    return (
      <div className="rounded-lg border border-[#302F28] bg-[#191916] p-3 shadow-xl">
        <p className="text-xs font-semibold text-[#E8DFC9] mb-2">{label} 2026</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#AFA58F]">
              <span className="h-2 w-2 rounded-full bg-[#C6FF4D]" />
              Inflow:
            </span>
            <span className="font-medium text-[#C6FF4D] tabular-nums">{formatINR(income)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#AFA58F]">
              <span className="h-2 w-2 rounded-full bg-[#AFA58F]" />
              Outflow:
            </span>
            <span className="font-medium text-[#E8DFC9] tabular-nums">{formatINR(expenses)}</span>
          </div>
          <div className="pt-1.5 mt-1 border-t border-[#302F28] flex items-center justify-between gap-4">
            <span className="text-[#777263]">Net saved:</span>
            <span className="font-semibold text-[#E8DFC9] tabular-nums">{formatINR(savings)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

/**
 * CashFlowChart Component
 * Visualizes monthly income vs expenditure using an AreaChart with
 * Neon Lime (#C6FF4D) for primary inflow and Warm Beige (#AFA58F) for outflow.
 * Dynamically sliced by timeframe (3M, 6M, 1Y).
 */
export default function CashFlowChart() {
  const { timeframe, setTimeframe, activeCashFlowData } = useDashboard()

  const latestMonth = activeCashFlowData[activeCashFlowData.length - 1]
  const currentSavingsRate = latestMonth
    ? Math.round(((latestMonth.income - latestMonth.expenses) / latestMonth.income) * 100)
    : 63

  return (
    <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
              Cash flow trend
            </h3>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-[#E8DFC9] bg-[#211F1A] border border-[#302F28] tabular-nums">
              <ArrowUpRight className="h-3 w-3 text-[#C6FF4D]" />
              {currentSavingsRate}% savings rate
            </span>
          </div>
          <p className="text-xs text-[#AFA58F] mt-0.5">
            Demonstration analysis of monthly inflow vs lifestyle outflow through November 2026
          </p>
        </div>

        {/* Timeframe Selector & Legend */}
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#AFA58F]">
              <span className="h-2 w-2 rounded-full bg-[#C6FF4D]" />
              Inflow
            </span>
            <span className="flex items-center gap-1.5 text-[#AFA58F]">
              <span className="h-2 w-2 rounded-full bg-[#AFA58F]" />
              Outflow
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border border-[#302F28] bg-[#121210] p-0.5 text-xs font-medium">
            {['3M', '6M', '1Y'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeframe(filter)}
                className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                  timeframe === filter
                    ? 'bg-[#211F1A] text-[#E8DFC9]'
                    : 'text-[#777263] hover:text-[#E8DFC9]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeCashFlowData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="neonInflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6FF4D" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C6FF4D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="beigeOutflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AFA58F" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#AFA58F" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#302F28"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#777263"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#302F28' }}
            />
            <YAxis
              stroke="#777263"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              name="Inflow"
              stroke="#C6FF4D"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#neonInflowGradient)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Outflow"
              stroke="#AFA58F"
              strokeWidth={1.75}
              fillOpacity={1}
              fill="url(#beigeOutflowGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
