import { Link } from 'react-router-dom'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

/**
 * BudgetOverview Component
 * Displays spending caps and usage progress for November 2026
 * using warm beige typography, tabular numerals, and dynamic derived context state.
 */
export default function BudgetOverview() {
  const { budgetUtilizationList } = useDashboard()

  const list = budgetUtilizationList || []
  const totalAllocated = list.reduce((acc, b) => acc + (Number(b.allocated) || 0), 0)
  const totalSpent = list.reduce((acc, b) => acc + (Number(b.spent) || 0), 0)
  const overallUsage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0
  const isOverBudget = overallUsage > 100

  return (
    <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
            Monthly budget
          </h3>
          <p className="text-xs text-[#AFA58F]">November 2026 expense caps</p>
        </div>
        <Link
          to="/budgets"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#AFA58F] hover:text-[#E8DFC9] hover:underline cursor-pointer transition-colors"
        >
          <span>Manage</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* High-Level Budget Capacity Meter */}
      <div className="mb-5 rounded-lg border border-[#302F28] bg-[#121210] p-3.5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#AFA58F]">Total cap consumed</span>
          <span className="font-medium text-[#E8DFC9] tabular-nums">
            {formatINR(totalSpent, { decimals: 0 })} / {formatINR(totalAllocated, { decimals: 0 })}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#211F1A]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-500' : 'bg-[#C6FF4D]'
            }`}
            style={{ width: `${Math.min(overallUsage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#AFA58F] mt-2">
          <span className="tabular-nums flex items-center gap-1">
            {isOverBudget ? (
              <span className="text-rose-400 font-medium">Exceeded ({overallUsage}%)</span>
            ) : (
              <span>{overallUsage}% utilized</span>
            )}
          </span>
          <span className="text-[#E8DFC9] font-medium tabular-nums">
            {isOverBudget
              ? `${formatINR(totalSpent - totalAllocated, { decimals: 0 })} over limit`
              : `${formatINR(Math.max(0, totalAllocated - totalSpent), { decimals: 0 })} buffer`}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3.5">
        {list.slice(0, 5).map((category) => {
          const isWarning = category.status === 'warning'
          const isExceeded = category.status === 'exceeded'

          const progressBarColor = isExceeded
            ? 'bg-rose-500'
            : isWarning
            ? 'bg-[#E8DFC9]'
            : 'bg-[#9CCB39]'

          return (
            <div key={category.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-normal text-[#E8DFC9] flex items-center gap-1.5">
                  {category.category}
                  {isWarning && (
                    <AlertCircle className="h-3 w-3 text-[#AFA58F]" />
                  )}
                  {isExceeded && (
                    <AlertCircle className="h-3 w-3 text-rose-400" />
                  )}
                </span>
                <span className="text-[#AFA58F] tabular-nums">
                  <strong className="text-[#E8DFC9] font-medium">
                    {formatINR(category.spent, { decimals: 0 })}
                  </strong>{' '}
                  / {formatINR(category.allocated, { decimals: 0 })}
                </span>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#211F1A]">
                <div
                  className={`h-full rounded-full ${progressBarColor} transition-all duration-300`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#777263] tabular-nums">
                <span>{category.percentage}% spent</span>
                <span>
                  {isExceeded
                    ? `${formatINR(category.spent - category.allocated, { decimals: 0 })} over`
                    : `${formatINR(Math.max(0, category.allocated - category.spent), { decimals: 0 })} left`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
