import {
  Briefcase,
  Home,
  TrendingUp,
  ShoppingBag,
  Zap,
  Coffee,
  CreditCard,
  ArrowUpRight,
  ChevronRight,
  SearchX,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

const iconMap = {
  Briefcase,
  Home,
  TrendingUp,
  ShoppingBag,
  Zap,
  Coffee,
  CreditCard,
}

/**
 * RecentTransactions Component
 * Refined ledger using tabular numerals, sentence-case metadata,
 * real-time search filtering, and quiet neutral borders.
 */
export default function RecentTransactions() {
  const { filteredTransactions, searchQuery, clearSearch, setIsAddTxModalOpen } = useDashboard()

  return (
    <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6">
      {/* Header with Title and View All */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
            Recent transactions
          </h3>
          <p className="text-xs text-[#AFA58F]">
            {searchQuery
              ? `Filtered by "${searchQuery}" (${filteredTransactions.length} result${filteredTransactions.length === 1 ? '' : 's'})`
              : 'Recorded sample transactions for November 2026'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#AFA58F] hover:text-[#E8DFC9] hover:underline cursor-pointer transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Transaction List or Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="py-10 text-center rounded-lg border border-dashed border-[#302F28] bg-[#121210]/60 p-6">
          <SearchX className="mx-auto h-7 w-7 text-[#777263] mb-2" />
          <p className="text-xs font-medium text-[#E8DFC9] mb-1">
            {searchQuery
              ? `No transactions matching "${searchQuery}"`
              : 'No transactions recorded yet'}
          </p>
          <p className="text-[11px] text-[#AFA58F] mb-3">
            {searchQuery
              ? 'Try adjusting your search terms or clear the filter.'
              : 'Add an income or expense entry to start tracking.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#302F28] bg-[#191916] px-3 text-xs font-medium text-[#C6FF4D] hover:bg-[#211F1A] transition-colors cursor-pointer"
            >
              Clear search
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddTxModalOpen(true)}
              className="inline-flex h-8 items-center justify-center rounded-md bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] transition-all cursor-pointer"
            >
              + Add Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#302F28]/60">
          {filteredTransactions.map((tx) => {
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
                    <span>{tx.status || 'Recorded'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
