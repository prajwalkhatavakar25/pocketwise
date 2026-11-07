import { useState } from 'react'
import {
  Compass,
  ShieldCheck,
  Target,
  Info,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'
import { calculateMonthlySavingsRequired } from '../utils/planning'

/**
 * Financial Planning Page
 * Transparent Safe-to-Spend liquidity calculations, interactive emergency reserve targets,
 * milestone roadmap, and disciplined cash flow heuristics.
 */
export default function FinancialPlanningPage() {
  const {
    safeToSpendData,
    savingsGoals,
    emergencyReserve,
    setEmergencyReserve,
  } = useDashboard()

  const [customReserve, setCustomReserve] = useState(emergencyReserve.toString())
  const [isEditingReserve, setIsEditingReserve] = useState(false)

  // Estimated baseline monthly living expenses from recurring + baseline budget
  const estimatedMonthlyLivingExpenses = 68400
  const reserveCoverageMonths =
    estimatedMonthlyLivingExpenses > 0
      ? (emergencyReserve / estimatedMonthlyLivingExpenses).toFixed(1)
      : '0.0'

  const handleSaveReserve = (e) => {
    e.preventDefault()
    const val = parseFloat(customReserve)
    if (!isNaN(val) && val >= 0) {
      setEmergencyReserve(val)
      setIsEditingReserve(false)
    }
  }

  const handlePresetReserve = (months) => {
    const val = estimatedMonthlyLivingExpenses * months
    setEmergencyReserve(val)
    setCustomReserve(val.toString())
  }

  const {
    availableBalance,
    committedExpenses,
    plannedSavings,
    discretionaryAmount,
    dailyLimit,
    weeklyLimit,
  } = safeToSpendData

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <section
        aria-label="Planning Header"
        className="flex flex-col gap-1"
      >
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
          Financial Planning & Safe-to-Spend
        </h2>
        <p className="text-xs sm:text-sm text-[#AFA58F]">
          Predictive liquidity engineering: know exactly how much you can spend without compromising fixed obligations or savings goals.
        </p>
      </section>

      {/* 2. Safe-to-Spend Liquidity Hero Card */}
      <section
        aria-label="Safe to Spend Hero"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-6 sm:p-7 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#302F28]/60">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium bg-[#121210] border border-[#302F28] text-[#C6FF4D] mb-3">
              <Compass className="h-3.5 w-3.5" />
              <span>Safe-to-Spend Metric · November 2026</span>
            </div>
            <div className="text-3xl sm:text-5xl font-bold text-[#C6FF4D] tracking-tight tabular-nums font-mono">
              {formatINR(discretionaryAmount, { decimals: 0 })}
            </div>
            <p className="text-xs sm:text-sm text-[#AFA58F] mt-2">
              Unrestricted discretionary funds remaining after accounting for all scheduled bills, savings goals, and emergency reserve protection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-xl border border-[#302F28] bg-[#121210] p-4">
              <span className="text-[11px] text-[#777263] block">Recommended Daily Cap</span>
              <span className="text-xl font-semibold text-[#E8DFC9] tabular-nums font-mono mt-1 block">
                {formatINR(dailyLimit, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F]">Across next 23 days</span>
            </div>

            <div className="rounded-xl border border-[#302F28] bg-[#121210] p-4">
              <span className="text-[11px] text-[#777263] block">Recommended Weekly Cap</span>
              <span className="text-xl font-semibold text-[#E8DFC9] tabular-nums font-mono mt-1 block">
                {formatINR(weeklyLimit, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F]">7-day expenditure pace</span>
            </div>
          </div>
        </div>

        {/* Mathematical Formula Transparency Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#E8DFC9]">
            <span>Safe-to-Spend Calculation Formula</span>
            <span className="text-[11px] text-[#777263] font-normal">Deterministic Liquidity Rule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Step 1: Available Liquid Net Worth */}
            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-1">
              <span className="text-[10px] text-[#777263] uppercase tracking-wider block">1. Liquid Balance</span>
              <span className="text-sm font-semibold text-[#E8DFC9] tabular-nums font-mono block">
                {formatINR(availableBalance, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F] block">Active Net Worth</span>
            </div>

            {/* Step 2: Committed Bills */}
            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-1">
              <span className="text-[10px] text-rose-400 uppercase tracking-wider block">2. (-) Committed Bills</span>
              <span className="text-sm font-semibold text-rose-300 tabular-nums font-mono block">
                -{formatINR(committedExpenses, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F] block">Active Recurring Obligations</span>
            </div>

            {/* Step 3: Planned Goal Savings */}
            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">3. (-) Goal Savings</span>
              <span className="text-sm font-semibold text-amber-300 tabular-nums font-mono block">
                -{formatINR(plannedSavings, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F] block">Monthly Target Allocations</span>
            </div>

            {/* Step 4: Emergency Reserve Target */}
            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-1">
              <span className="text-[10px] text-sky-400 uppercase tracking-wider block">4. (-) Emergency Buffer</span>
              <span className="text-sm font-semibold text-sky-300 tabular-nums font-mono block">
                -{formatINR(emergencyReserve, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#AFA58F] block">Protected Capital Lock</span>
            </div>

            {/* Step 5: Discretionary Output */}
            <div className="rounded-lg border border-[#C6FF4D]/40 bg-[#211F1A] p-3 space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] text-[#C6FF4D] uppercase tracking-wider block">5. (=) Safe-to-Spend</span>
              <span className="text-sm font-semibold text-[#C6FF4D] tabular-nums font-mono block">
                {formatINR(discretionaryAmount, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-[#E8DFC9] block">True Discretionary Limit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Emergency Reserve Protection Planner */}
      <section
        aria-label="Emergency Reserve Planner"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C6FF4D]" />
              <span>Emergency Reserve Protection</span>
            </h3>
            <p className="text-xs text-[#AFA58F] mt-0.5">
              Locking an emergency reserve insulates your essential living expenses against unforeseen crises.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777263]">Target Buffer:</span>
            {isEditingReserve ? (
              <form onSubmit={handleSaveReserve} className="flex items-center gap-2">
                <input
                  type="number"
                  step="5000"
                  value={customReserve}
                  onChange={(e) => setCustomReserve(e.target.value)}
                  className="w-32 rounded-lg border border-[#302F28] bg-[#121210] px-2.5 py-1 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-2.5 py-1 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingReserve(false)}
                  className="text-xs text-[#AFA58F] hover:text-[#E8DFC9] cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#E8DFC9] tabular-nums font-mono">
                  {formatINR(emergencyReserve, { decimals: 0 })}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingReserve(true)}
                  className="text-xs text-[#C6FF4D] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coverage Ratio Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#302F28] bg-[#121210] p-4">
            <span className="text-xs text-[#777263] block">Reserve Coverage Ratio</span>
            <div className="text-2xl font-bold text-[#E8DFC9] tabular-nums font-mono mt-1">
              {reserveCoverageMonths} <span className="text-sm font-normal text-[#AFA58F]">Months</span>
            </div>
            <span className="text-[11px] text-[#AFA58F] mt-1 block">
              Based on ~{formatINR(estimatedMonthlyLivingExpenses, { decimals: 0 })} / month living expenses
            </span>
          </div>

          <div className="md:col-span-2 rounded-lg border border-[#302F28] bg-[#121210] p-4 flex flex-col justify-between">
            <span className="text-xs text-[#777263]">Quick Recommended Presets</span>
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => handlePresetReserve(3)}
                className={`rounded-lg border p-2 text-center transition-colors cursor-pointer ${
                  emergencyReserve === estimatedMonthlyLivingExpenses * 3
                    ? 'border-[#C6FF4D] bg-[#211F1A] text-[#C6FF4D]'
                    : 'border-[#302F28] hover:bg-[#211F1A] text-[#E8DFC9]'
                }`}
              >
                <span className="text-xs font-semibold block">3 Months</span>
                <span className="text-[10px] text-[#AFA58F] font-mono mt-0.5 block">
                  {formatINR(estimatedMonthlyLivingExpenses * 3, { decimals: 0 })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetReserve(6)}
                className={`rounded-lg border p-2 text-center transition-colors cursor-pointer ${
                  emergencyReserve === estimatedMonthlyLivingExpenses * 6
                    ? 'border-[#C6FF4D] bg-[#211F1A] text-[#C6FF4D]'
                    : 'border-[#302F28] hover:bg-[#211F1A] text-[#E8DFC9]'
                }`}
              >
                <span className="text-xs font-semibold block">6 Months</span>
                <span className="text-[10px] text-[#AFA58F] font-mono mt-0.5 block">
                  {formatINR(estimatedMonthlyLivingExpenses * 6, { decimals: 0 })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetReserve(12)}
                className={`rounded-lg border p-2 text-center transition-colors cursor-pointer ${
                  emergencyReserve === estimatedMonthlyLivingExpenses * 12
                    ? 'border-[#C6FF4D] bg-[#211F1A] text-[#C6FF4D]'
                    : 'border-[#302F28] hover:bg-[#211F1A] text-[#E8DFC9]'
                }`}
              >
                <span className="text-xs font-semibold block">12 Months</span>
                <span className="text-[10px] text-[#AFA58F] font-mono mt-0.5 block">
                  {formatINR(estimatedMonthlyLivingExpenses * 12, { decimals: 0 })}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Financial Milestone Timeline Roadmap */}
      <section
        aria-label="Milestone Roadmap"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight flex items-center gap-2">
            <Target className="h-4 w-4 text-[#C6FF4D]" />
            <span>Savings Milestone Roadmap</span>
          </h3>
          <span className="text-xs text-[#777263]">Chronological target forecast</span>
        </div>

        <div className="space-y-3">
          {savingsGoals.map((g) => {
            const monthlyRequired = calculateMonthlySavingsRequired({
              target: g.target,
              current: g.current,
              monthsRemaining: 12,
            })
            const remaining = Math.max(0, g.target - g.current)

            return (
              <div
                key={g.id}
                className="rounded-xl border border-[#302F28] bg-[#121210] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#191916] border border-[#302F28] text-[#C6FF4D]">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#E8DFC9]">{g.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#777263] mt-0.5">
                      <span>Target Date: {g.targetDate || '2027-11-30'}</span>
                      <span>·</span>
                      <span>Remaining: {formatINR(remaining, { decimals: 0 })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-0 border-[#302F28]/40 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#777263] uppercase tracking-wider block">
                      Required Monthly Deposit
                    </span>
                    <span className="text-sm font-semibold text-[#C6FF4D] tabular-nums font-mono">
                      {formatINR(monthlyRequired, { decimals: 0 })} / mo
                    </span>
                  </div>

                  <span className="rounded px-2.5 py-1 text-xs font-mono font-medium border border-[#302F28] bg-[#191916] text-[#E8DFC9]">
                    {Math.round((g.current / g.target) * 100)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Fintech Heuristics & Allocation Guidance */}
      <section
        aria-label="Fintech Allocation Guidelines"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E8DFC9]">
          <Info className="h-4 w-4 text-[#AFA58F]" />
          <span>Fintech Principles: Safe-to-Spend Liquidity Management</span>
        </div>
        <p className="text-xs text-[#AFA58F] leading-relaxed">
          Standard personal finance doctrine advises that discretionary spending should only be drawn from true net surplus after accounting for upcoming debt service, monthly fixed commitments, and priority savings targets. By enforcing an explicit emergency reserve floor, you avoid liquidity shocks without needing restrictive, penny-pinching micro-budgets.
        </p>
      </section>
    </div>
  )
}
