import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Plus,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  ShoppingBag,
  Home,
  Zap,
  Coffee,
  CreditCard,
  Briefcase,
  TrendingUp,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

const categoryIcons = {
  Housing: Home,
  Groceries: ShoppingBag,
  Utilities: Zap,
  Entertainment: Coffee,
  Dining: Coffee,
  Transport: CreditCard,
  Health: Zap,
  Salary: Briefcase,
  Investments: TrendingUp,
}

const AVAILABLE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Utilities',
  'Dining',
  'Entertainment',
  'Transport',
  'Health',
  'Education',
  'Personal Care',
  'Shopping',
  'Travel',
  'Miscellaneous',
]

/**
 * Monthly Budgets Page
 * Dynamic expenditure caps derived strictly from real ledger transactions.
 * Includes alert threshold badges, safe-to-spend buffer calculations, and transaction drill-down.
 */
export default function BudgetsPage() {
  const {
    budgetUtilizationList,
    transactions,
    addBudget,
    editBudget,
    deleteBudget,
  } = useDashboard()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteConfirmBudget, setDeleteConfirmBudget] = useState(null)
  const [formData, setFormData] = useState({ category: 'Dining', allocated: '' })
  const [errorMessage, setErrorMessage] = useState('')

  const list = budgetUtilizationList || []
  const totalAllocated = list.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0)
  const totalSpent = list.reduce((sum, b) => sum + (Number(b.spent) || 0), 0)
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0
  const isOverTotal = overallPercentage > 100

  // Filtered transactions for selected category drill-down
  const categoryTransactions = selectedCategory
    ? transactions.filter(
        (tx) => tx.type === 'expense' && tx.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : []

  const handleOpenAdd = () => {
    // Pick first category not yet in list
    const existing = new Set(list.map((b) => b.category))
    const firstAvailable = AVAILABLE_CATEGORIES.find((c) => !existing.has(c)) || 'Miscellaneous'
    setFormData({ category: firstAvailable, allocated: '' })
    setErrorMessage('')
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(formData.allocated)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Allocated budget cap must be greater than zero')
      return
    }

    const result = addBudget({
      category: formData.category,
      allocated: num,
    })

    if (!result.success) {
      setErrorMessage(result.error)
      return
    }

    setIsAddModalOpen(false)
  }

  const handleOpenEdit = (b) => {
    setEditingBudget(b)
    setFormData({ category: b.category, allocated: b.allocated })
    setErrorMessage('')
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(formData.allocated)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Allocated budget cap must be greater than zero')
      return
    }

    editBudget(editingBudget.id, { allocated: num })
    setEditingBudget(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmBudget) return
    deleteBudget(deleteConfirmBudget.id)
    if (selectedCategory === deleteConfirmBudget.category) {
      setSelectedCategory(null)
    }
    setDeleteConfirmBudget(null)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action */}
      <section
        aria-label="Budgets Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Monthly Budgets
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Real-time expenditure limits derived strictly from expense transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.2]" />
          <span>New Budget Cap</span>
        </button>
      </section>

      {/* 2. Consolidated Budget Health Hero */}
      <section
        aria-label="Budget Health Summary"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-[#777263] uppercase tracking-wider block">
              November 2026 Monthly Budget Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-semibold text-[#E8DFC9] tabular-nums font-mono">
                {formatINR(totalSpent, { decimals: 0 })}
              </span>
              <span className="text-xs text-[#AFA58F] font-mono">
                consumed of {formatINR(totalAllocated, { decimals: 0 })} limit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOverTotal ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                Budget Exceeded ({overallPercentage}%)
              </span>
            ) : overallPercentage > 85 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#302F28] bg-[#211F1A] px-3 py-1.5 text-xs font-medium text-[#E8DFC9]">
                <AlertCircle className="h-4 w-4 text-[#AFA58F]" />
                Approaching Cap ({overallPercentage}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#302F28] bg-[#211F1A] px-3 py-1.5 text-xs font-medium text-[#C6FF4D]">
                <CheckCircle2 className="h-4 w-4" />
                Within Safe Limits ({overallPercentage}%)
              </span>
            )}
          </div>
        </div>

        {/* Primary Usage Progress Track */}
        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#121210] border border-[#302F28]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverTotal ? 'bg-rose-500' : 'bg-[#C6FF4D]'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#AFA58F]">
            <span className="tabular-nums font-mono">{overallPercentage}% allocated limit utilized</span>
            <span className="text-[#E8DFC9] font-medium tabular-nums font-mono">
              {isOverTotal
                ? `${formatINR(totalSpent - totalAllocated, { decimals: 0 })} over budget`
                : `${formatINR(Math.max(0, totalAllocated - totalSpent), { decimals: 0 })} buffer available`}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Category Budgets Grid */}
      <section aria-label="Category Budgets" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E8DFC9] tracking-tight">
            Category Caps ({list.length})
          </h3>
          <span className="text-xs text-[#777263]">
            Click any category card to drill down into expenses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((b) => {
            const Icon = categoryIcons[b.category] || PieChart
            const isSelected = selectedCategory === b.category
            const isWarning = b.status === 'warning'
            const isExceeded = b.status === 'exceeded'

            const progressColor = isExceeded
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-[#E8DFC9]'
              : 'bg-[#9CCB39]'

            return (
              <div
                key={b.id}
                onClick={() => setSelectedCategory(isSelected ? null : b.category)}
                className={`rounded-xl border p-5 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#C6FF4D] bg-[#211F1A] shadow-lg shadow-black/40'
                    : 'border-[#302F28] bg-[#191916] hover:border-[#777263]/60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28] text-[#C6FF4D]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#E8DFC9]">{b.category}</h4>
                      <span className="text-[10px] text-[#777263]">Monthly Cap</span>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                      isExceeded
                        ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                        : isWarning
                        ? 'border-[#777263]/40 bg-[#121210] text-[#E8DFC9]'
                        : 'border-[#302F28] bg-[#121210] text-[#AFA58F]'
                    }`}
                  >
                    {b.percentage}% spent
                  </span>
                </div>

                {/* Spending Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#121210]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#AFA58F] tabular-nums font-mono">
                      Spent: <strong className="text-[#E8DFC9]">{formatINR(b.spent, { decimals: 0 })}</strong>
                    </span>
                    <span className="text-[#777263] tabular-nums font-mono">
                      Cap: {formatINR(b.allocated, { decimals: 0 })}
                    </span>
                  </div>
                </div>

                {/* Remaining Buffer / Warning Message */}
                <div className="text-[11px] pt-2 border-t border-[#302F28]/60 flex items-center justify-between">
                  <span className="text-[#777263]">
                    {isExceeded ? (
                      <span className="text-rose-400 font-medium">Over limit by {formatINR(b.spent - b.allocated, { decimals: 0 })}</span>
                    ) : (
                      <span>Buffer: {formatINR(b.remaining, { decimals: 0 })}</span>
                    )}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      aria-label="Edit budget cap"
                      className="text-[#AFA58F] hover:text-[#E8DFC9] p-0.5 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmBudget(b)}
                      aria-label="Delete budget cap"
                      className="text-rose-400 hover:text-rose-300 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Category Drill-down Drawer */}
      {selectedCategory && (
        <section
          aria-label="Category Expense Breakdown"
          className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight">
                {selectedCategory} Expenses
              </h3>
              <p className="text-xs text-[#777263]">
                Audit trail of ledger expenses contributing to this category's total spent.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/transactions?search=${encodeURIComponent(selectedCategory)}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#C6FF4D] hover:underline cursor-pointer"
              >
                <span>View in Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg p-1 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {categoryTransactions.length === 0 ? (
            <p className="text-xs text-[#777263] py-4 text-center">
              No expense transactions logged in {selectedCategory} this month.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#302F28] text-[#777263]">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Title</th>
                    <th className="py-2 pr-4 font-medium">Merchant</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302F28]/50">
                  {categoryTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#211F1A]/40 transition-colors">
                      <td className="py-2.5 pr-4 text-[#AFA58F] tabular-nums font-mono">{tx.date}</td>
                      <td className="py-2.5 pr-4 text-[#E8DFC9] font-medium">{tx.title}</td>
                      <td className="py-2.5 pr-4 text-[#777263]">{tx.merchant || '—'}</td>
                      <td className="py-2.5 text-right font-medium text-[#E8DFC9] tabular-nums font-mono">
                        {formatINR(tx.amount, { decimals: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* --- ADD BUDGET MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Create Budget Cap</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#AFA58F] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Category Name
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                >
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Monthly Cap (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 15000"
                  value={formData.allocated}
                  onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-[#302F28] px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Save Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT BUDGET MODAL --- */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">
                Edit Budget Cap: {editingBudget.category}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBudget(null)}
                className="text-[#AFA58F] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Monthly Allocated Limit (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={formData.allocated}
                  onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="rounded-lg border border-[#302F28] px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Update Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteConfirmBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#E8DFC9]">Delete Budget Cap</h3>
            <p className="text-xs text-[#AFA58F] leading-relaxed">
              Remove the budget cap for <strong className="text-[#E8DFC9]">{deleteConfirmBudget.category}</strong>?
              Past transactions will not be deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBudget(null)}
                className="rounded-lg border border-[#302F28] px-3 py-1.5 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                Delete Cap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
