import { Target, Plus } from 'lucide-react'
import { savingsGoals } from '../data/dashboardData'
import { formatINR } from '../utils/formatters'

/**
 * SavingsGoals Component
 * Tracks capital allocation milestones with tabular numerals and quiet borders.
 */
export default function SavingsGoals() {
  return (
    <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
            Savings goals
          </h3>
          <p className="text-xs text-[#AFA58F]">Capital allocation targets</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#AFA58F] hover:text-[#E8DFC9] hover:underline cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New goal</span>
        </button>
      </div>

      {/* Goal Cards */}
      <div className="space-y-3">
        {savingsGoals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100)
          )

          return (
            <div
              key={goal.id}
              className="rounded-lg border border-[#302F28] bg-[#121210] p-3.5 space-y-2 hover:border-[#777263]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#211F1A] border border-[#302F28]"
                  >
                    <Target className="h-3 w-3" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[#E8DFC9]">{goal.title}</h4>
                    <p className="text-[10px] text-[#AFA58F]">{goal.description}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#E8DFC9] tabular-nums">
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#211F1A]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, backgroundColor: goal.color }}
                />
              </div>

              {/* Bottom stats: current vs target and deadline */}
              <div className="flex items-center justify-between text-[11px] text-[#AFA58F]">
                <span className="tabular-nums">
                  <strong className="text-[#E8DFC9] font-medium">
                    {formatINR(goal.current, { decimals: 0 })}
                  </strong>{' '}
                  / {formatINR(goal.target, { decimals: 0 })}
                </span>
                <span className="text-[10px] text-[#777263]">
                  Target: {goal.targetDate}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
