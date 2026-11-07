import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatINR, formatPercentage } from '../utils/formatters'

/**
 * StatCard Component
 * Quiet, number-first financial metric card.
 * Free of decorative icon boxes, using tabular numerals and sentence-case labels.
 * 
 * @param {Object} props
 * @param {string} props.title - Metric label (e.g. "Total balance")
 * @param {number|string} props.value - Monetary value (rendered in INR ₹)
 * @param {number} [props.change] - Percentage delta
 * @param {('positive'|'negative'|'neutral')} [props.changeType='positive']
 * @param {string} [props.period='vs last month'] - Comparison label
 */
export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  period = 'vs last month',
}) {
  const formattedValue = typeof value === 'number' ? formatINR(value) : value
  const isPositive = changeType === 'positive'
  const isNegative = changeType === 'negative'

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 hover:border-[#777263]/40 transition-colors">
      {/* Label in quiet sentence case */}
      <div>
        <p className="text-xs font-medium text-[#AFA58F]">
          {title}
        </p>
      </div>

      {/* Primary Value with Tabular Numerals */}
      <div className="my-2.5">
        <span className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#E8DFC9] tabular-nums">
          {formattedValue}
        </span>
      </div>

      {/* Comparison Reference with Tabular Numerals */}
      <div className="flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
              isPositive
                ? 'bg-[#C6FF4D]/10 text-[#C6FF4D]'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-[#211F1A] text-[#777263]'
            }`}
          >
            {isPositive && <ArrowUpRight className="h-3 w-3 stroke-[2]" />}
            {isNegative && <ArrowDownRight className="h-3 w-3 stroke-[2]" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
            {formatPercentage(change)}
          </span>
        )}
        <span className="text-[#777263] text-xs font-normal">{period}</span>
      </div>
    </div>
  )
}
