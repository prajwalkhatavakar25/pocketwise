import {
  Briefcase,
  Home,
  TrendingUp,
  ShoppingBag,
  Zap,
  Coffee,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import { recentTransactions } from '../data/dashboardData'
import { formatINR } from '../utils/formatters'

const iconMap = {
  Briefcase,
  Home,
  TrendingUp,
  ShoppingBag,
  Zap,
  Coffee,
}

/**
 * RecentTransactions Component
 * Refined ledger using tabular numerals, sentence-case metadata,
 * and quiet neutral borders.
 */
export default function RecentTransactions() {
  return (
    <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6">
      {/* Header with Title and View All */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
            Recent transactions
          </h3>
          <p className="text-xs text-[#AFA58F]">
            Recorded sample transactions for November 2026
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#AFA58F] hover:text-[#E8DFC9] hover:underline cursor-pointer transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-[#302F28]/60">
        {recentTransactions.map((tx) => {
          const Icon = iconMap[tx.iconName] || Briefcase
          const isIncome = tx.type === 'income'

          return (
            <div
              key={tx.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-[#211F1A]/40 -mx-2 px-2 rounded-lg transition-colors"
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#302F28] bg-[#121210] text-[#AFA58F]"
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#E8DFC9] truncate">
                    {tx.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#AFA58F]">
                    <span className="truncate">{tx.category}</span>
                    <span className="text-[#777263]">·</span>
                    <span className="text-[#777263] truncate">{tx.date}</span>
                  </div>
                </div>
              </div>

              {/* Right: Amount & Status Badge */}
              <div className="text-right shrink-0">
                <p
                  className={`text-xs sm:text-sm font-medium tracking-tight tabular-nums ${
                    isIncome ? 'text-[#C6FF4D]' : 'text-[#E8DFC9]'
                  }`}
                >
                  {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#777263]">
                  {isIncome && <ArrowUpRight className="h-2.5 w-2.5 text-[#C6FF4D]" />}
                  <span>{tx.status}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
