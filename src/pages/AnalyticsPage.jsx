import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

const PALETTE_COLORS = [
  '#C6FF4D',
  '#9CCB39',
  '#657343',
  '#E8DFC9',
  '#AFA58F',
  '#777263',
  '#534E42',
  '#3A372E',
]

/**
 * Custom Dark Tooltip for Charts
 */
function DarkTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#302F28] bg-[#191916] p-3 shadow-xl text-xs">
        {label && <p className="font-semibold text-[#E8DFC9] mb-1.5">{label}</p>}
        {payload.map((entry, idx) => (
          <div key={`tip-${idx}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-[#AFA58F]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name || entry.dataKey}:
            </span>
            <span className="font-semibold text-[#E8DFC9] tabular-nums font-mono">
              {typeof entry.value === 'number' ? formatINR(entry.value, { decimals: 0 }) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Financial Analytics & Trends Page
 * Multi-chart visual breakdown (Cash flow area, Category Donut, Account comparison, Budget variance)
 * alongside deterministic, explainable spending insights.
 */
export default function AnalyticsPage() {
  const {
    timeframe,
    setTimeframe,
    activeCashFlowData,
    analyticsMetrics,
    categoryExpensesDistribution,
    spendingInsights,
    budgetUtilizationList,
    accounts,
    transactions,
  } = useDashboard()

  // Calculate account spending distribution
  const accountSpendingData = accounts.map((acc) => {
    const totalSpent = transactions
      .filter((tx) => tx.accountId === acc.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    return {
      name: acc.name,
      amount: totalSpent,
    }
  }).filter((a) => a.amount > 0)

  // Budget vs Actual Comparison Data
  const budgetComparisonData = (budgetUtilizationList || []).map((b) => ({
    category: b.category,
    allocated: b.allocated,
    spent: b.spent,
  }))

  const { savingsRate, totalInflow, totalOutflow, netSavings } = analyticsMetrics

  return (
    <div className="space-y-6">
      {/* 1. Header & Timeframe Selector */}
      <section
        aria-label="Analytics Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Financial Analytics & Trends
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Visual trends, category distributions, and deterministic spending insights.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-[#302F28] bg-[#121210] p-1 self-start sm:self-auto">
          {['3M', '6M', '1Y'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#211F1A] text-[#C6FF4D] shadow-xs'
                  : 'text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-[#302F28] bg-[#191916] p-4 sm:p-5"
      >
        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Savings Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-[#C6FF4D] tabular-nums font-mono">
              {savingsRate}%
            </span>
            <span className="text-xs text-[#AFA58F] flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#C6FF4D]" />
              Strong
            </span>
          </div>
          <span className="text-[10px] text-[#777263] mt-1 block">Inflow surplus efficiency</span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Period Total Inflow</span>
          <div className="text-2xl font-semibold text-[#E8DFC9] tabular-nums font-mono mt-1">
            {formatINR(totalInflow, { decimals: 0 })}
          </div>
          <span className="text-[10px] text-[#777263] mt-1 block">Cumulative gross income</span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Period Total Outflow</span>
          <div className="text-2xl font-semibold text-[#E8DFC9] tabular-nums font-mono mt-1">
            {formatINR(totalOutflow, { decimals: 0 })}
          </div>
          <span className="text-[10px] text-[#777263] mt-1 block">Total debited expenses</span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Net Capital Retained</span>
          <div className="text-2xl font-semibold text-[#C6FF4D] tabular-nums font-mono mt-1">
            {formatINR(netSavings, { decimals: 0 })}
          </div>
          <span className="text-[10px] text-[#777263] mt-1 block">Net balance generated</span>
        </div>
      </section>

      {/* 3. Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cash Flow Trend (Area Chart) */}
        <section
          aria-label="Cash Flow History Chart"
          className="lg:col-span-8 rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight">
                Cash Flow Dynamics ({timeframe})
              </h3>
              <p className="text-xs text-[#AFA58F]">Inflow vs Outflow trendline over time</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#E8DFC9]">
                <span className="h-2 w-2 rounded-full bg-[#C6FF4D]" />
                Inflow
              </span>
              <span className="flex items-center gap-1.5 text-[#E8DFC9]">
                <span className="h-2 w-2 rounded-full bg-[#AFA58F]" />
                Outflow
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6FF4D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C6FF4D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analyticsOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AFA58F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#AFA58F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#302F28" vertical={false} />
                <XAxis dataKey="month" stroke="#777263" tick={{ fill: '#AFA58F', fontSize: 11 }} />
                <YAxis
                  stroke="#777263"
                  tick={{ fill: '#AFA58F', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Inflow"
                  stroke="#C6FF4D"
                  strokeWidth={2}
                  fill="url(#analyticsInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Outflow"
                  stroke="#AFA58F"
                  strokeWidth={1.5}
                  fill="url(#analyticsOutflow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Right: Category Distribution Donut Chart */}
        <section
          aria-label="Category Expenses Donut"
          className="lg:col-span-4 rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight">
              Expense Allocation
            </h3>
            <p className="text-xs text-[#AFA58F]">Share by expenditure category</p>

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpensesDistribution}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryExpensesDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Legend List */}
          <div className="space-y-1.5 pt-2 border-t border-[#302F28]/60 text-xs max-h-40 overflow-y-auto">
            {categoryExpensesDistribution.slice(0, 5).map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#AFA58F] truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: PALETTE_COLORS[index % PALETTE_COLORS.length] }}
                  />
                  <span className="truncate">{item.category}</span>
                </span>
                <span className="text-[#E8DFC9] font-medium font-mono tabular-nums shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Secondary Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Comparison */}
        <section
          aria-label="Budget vs Actual Comparison"
          className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight">
                Budget vs. Actual Variance
              </h3>
              <p className="text-xs text-[#AFA58F]">Monthly cap vs real ledger consumption</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#AFA58F]">
                <span className="h-2 w-2 rounded-full bg-[#777263]" />
                Cap
              </span>
              <span className="flex items-center gap-1.5 text-[#E8DFC9]">
                <span className="h-2 w-2 rounded-full bg-[#C6FF4D]" />
                Spent
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#302F28" vertical={false} />
                <XAxis dataKey="category" stroke="#777263" tick={{ fill: '#AFA58F', fontSize: 10 }} />
                <YAxis
                  stroke="#777263"
                  tick={{ fill: '#AFA58F', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="allocated" name="Cap" fill="#302F28" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#C6FF4D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Spending by Account */}
        <section
          aria-label="Spending by Account"
          className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
        >
          <div>
            <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight">
              Spending by Account
            </h3>
            <p className="text-xs text-[#AFA58F]">Outflows debited from each account</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accountSpendingData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#302F28" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#777263"
                  tick={{ fill: '#AFA58F', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#777263"
                  tick={{ fill: '#E8DFC9', fontSize: 11 }}
                  width={110}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="amount" name="Spent" fill="#9CCB39" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 5. Deterministic Spending Insights List */}
      <section
        aria-label="Explainable Spending Insights"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E8DFC9]">
          <Lightbulb className="h-4 w-4 text-[#C6FF4D]" />
          <span>Deterministic Cash Flow Intelligence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {spendingInsights.map((insight, idx) => (
            <div
              key={`insight-${idx}`}
              className="rounded-lg border border-[#302F28] bg-[#121210] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E8DFC9]">{insight.title}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    insight.level === 'positive'
                      ? 'bg-[#C6FF4D]'
                      : insight.level === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-[#AFA58F]'
                  }`}
                />
              </div>
              <p className="text-xs text-[#AFA58F] leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
