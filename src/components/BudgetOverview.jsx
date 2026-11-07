import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { budgetCategories } from '../data/dashboardData'
import { formatINR, calculateBudgetStatus } from '../utils/formatters'

/**
 * BudgetOverview Component
 * Displays spending caps and usage progress for November 2026
 * using warm beige typography and tabular numerals.
 */
export default function BudgetOverview() {
  const totalAllocated = budgetCategories.reduce((acc, b) => acc + b.allocated, 0)
  const totalSpent = budgetCategories.reduce((acc, b) => acc + b.spent, 0)
  const overallUsage = Math.round((totalSpent / totalAllocated) * 100)

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
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-[#E8DFC9] bg-[#211F1A] border border-[#302F28]">
          <CheckCircle2 className="h-3 w-3 text-[#C6FF4D]" />
          On track
        </span>
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
            className="h-full rounded-full bg-[#C6FF4D] transition-all duration-300"
            style={{ width: `${overallUsage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#AFA58F] mt-2">
          <span className="tabular-nums">{overallUsage}% utilized</span>
          <span className="text-[#E8DFC9] font-medium tabular-nums">
            {formatINR(totalAllocated - totalSpent, { decimals: 0 })} buffer remaining
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3.5">
        {budgetCategories.map((category) => {
          const { percentage, status } = calculateBudgetStatus(
            category.spent,
            category.allocated
          )

          const isWarning = status === 'warning'
          const isExceeded = status === 'exceeded'

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
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#777263] tabular-nums">
                <span>{percentage}% spent</span>
                <span>
                  {formatINR(category.allocated - category.spent, { decimals: 0 })} left
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
