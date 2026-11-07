import { Download, BookOpen } from 'lucide-react'
import StatCard from '../components/StatCard'
import CashFlowChart from '../components/CashFlowChart'
import RecentTransactions from '../components/RecentTransactions'
import BudgetOverview from '../components/BudgetOverview'
import SavingsGoals from '../components/SavingsGoals'
import { summaryMetrics } from '../data/dashboardData'

/**
 * Dashboard Page
 * Unslop-refined financial overview for November 2026.
 * Clean, number-first layout with zero duplicate headers or artificial transfers.
 */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Contextual Period Title & Legitimate Secondary Action */}
      <section
        aria-label="Dashboard Overview Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            November 2026 Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Demonstration workspace tracking liquidity, expenditure caps, and savings progress.
          </p>
        </div>

        {/* Quiet Secondary Action */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#302F28] bg-[#191916] px-3.5 text-xs font-medium text-[#E8DFC9] hover:bg-[#211F1A] hover:border-[#777263] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#AFA58F]" />
            <span>Export statement</span>
          </button>
        </div>
      </section>

      {/* 2. Four Financial Summary Cards */}
      <section aria-label="Financial Summary Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {summaryMetrics.map((metric) => (
            <StatCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              period={metric.period}
            />
          ))}
        </div>
      </section>

      {/* 3. Balanced Two-Column Desktop Content Grid */}
      <section aria-label="Dashboard Details" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Cash Flow Chart + Recent Transactions */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <CashFlowChart />
          <RecentTransactions />
        </div>

        {/* RIGHT COLUMN: Budget Overview + Savings Goals + Financial Literacy Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <BudgetOverview />
          <SavingsGoals />

          {/* Educational Insight Card */}
          <div className="rounded-xl border border-[#302F28] bg-[#191916] p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E8DFC9] mb-2">
              <BookOpen className="h-4 w-4 text-[#AFA58F]" />
              <span>Financial Literacy: The 50/30/20 Rule</span>
            </div>
            <p className="text-xs text-[#AFA58F] leading-relaxed mb-3">
              Standard guidelines suggest reserving <strong className="text-[#E8DFC9] font-medium">50%</strong> for essential needs, <strong className="text-[#E8DFC9] font-medium">30%</strong> for discretionary expenses, and allocating at least <strong className="text-[#C6FF4D] font-medium">20%</strong> toward long-term savings.
            </p>
            <button
              type="button"
              className="text-xs font-medium text-[#AFA58F] hover:text-[#E8DFC9] hover:underline cursor-pointer transition-colors"
            >
              Read full budget allocation guide →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
