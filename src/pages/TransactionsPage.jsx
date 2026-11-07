import { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Plus,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Briefcase,
  Home,
  TrendingUp,
  ShoppingBag,
  Zap,
  Coffee,
  ArrowRightLeft,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'
import { calculateLedgerTotals } from '../utils/transactions'

const categoryIcons = {
  Salary: Briefcase,
  Investments: TrendingUp,
  Freelance: TrendingUp,
  Housing: Home,
  Groceries: ShoppingBag,
  Utilities: Zap,
  Entertainment: Coffee,
  Dining: Coffee,
  Transport: CreditCard,
  Education: CreditCard,
  Health: Zap,
  Transfers: ArrowRightLeft,
}

const CATEGORIES = [
  'All',
  'Salary',
  'Investments',
  'Freelance',
  'Housing',
  'Groceries',
  'Utilities',
  'Dining',
  'Entertainment',
  'Transport',
  'Health',
  'Education',
  'Transfers',
  'Miscellaneous',
]

/**
 * Transactions Ledger Page
 * Complete financial transaction history with multi-dimensional filtering,
 * live search, sorting, CSV export, and full record editing/deletion.
 */
export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    setIsAddTxModalOpen,
    exportStatementCSV,
    editTransaction,
    deleteTransaction,
    searchQuery: globalSearchQuery,
    setSearchQuery: setGlobalSearchQuery,
  } = useDashboard()

  // Local filter states
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [accountFilter, setAccountFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')

  // Modals state
  const [editingTx, setEditingTx] = useState(null)
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Groceries',
    accountId: '',
    date: '',
    notes: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  // Multi-dimensional filtering
  const filteredList = useMemo(() => {
    let result = [...transactions]

    // 1. Text Search across Title, Merchant, Category, and Notes
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          (tx.title && tx.title.toLowerCase().includes(q)) ||
          (tx.merchant && tx.merchant.toLowerCase().includes(q)) ||
          (tx.category && tx.category.toLowerCase().includes(q)) ||
          (tx.notes && tx.notes.toLowerCase().includes(q))
      )
    }

    // 2. Type Filter (all, income, expense, transfer)
    if (typeFilter !== 'all') {
      result = result.filter((tx) => tx.type === typeFilter)
    }

    // 3. Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter((tx) => tx.category === categoryFilter)
    }

    // 4. Account Filter
    if (accountFilter !== 'All') {
      result = result.filter(
        (tx) => tx.accountId === accountFilter || tx.toAccountId === accountFilter
      )
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date)
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date)
      }
      if (sortBy === 'amount-desc') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0)
      }
      if (sortBy === 'amount-asc') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0)
      }
      return 0
    })

    return result
  }, [transactions, globalSearchQuery, typeFilter, categoryFilter, accountFilter, sortBy])

  // Filtered Totals
  const ledgerTotals = useMemo(() => {
    return calculateLedgerTotals(filteredList)
  }, [filteredList])

  const handleResetFilters = () => {
    setGlobalSearchQuery('')
    setTypeFilter('all')
    setCategoryFilter('All')
    setAccountFilter('All')
    setSortBy('date-desc')
  }

  const handleOpenEdit = (tx) => {
    setEditingTx(tx)
    setEditFormData({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      accountId: tx.accountId || (accounts[0]?.id || ''),
      date: tx.date,
      notes: tx.notes || '',
    })
    setErrorMessage('')
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(editFormData.amount)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Amount must be a positive number')
      return
    }

    if (!editFormData.title.trim()) {
      setErrorMessage('Title description is required')
      return
    }

    editTransaction(editingTx.id, {
      title: editFormData.title.trim(),
      amount: num,
      type: editFormData.type,
      category: editFormData.category,
      accountId: editFormData.accountId,
      date: editFormData.date,
      notes: editFormData.notes.trim(),
    })

    setEditingTx(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmTx) return
    deleteTransaction(deleteConfirmTx.id)
    setDeleteConfirmTx(null)
  }

  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === accId)
    return acc ? acc.name : 'Primary'
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Controls */}
      <section
        aria-label="Ledger Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Audit trail of income inflows, expenses, and inter-account transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportStatementCSV}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#302F28] bg-[#191916] px-3.5 text-xs font-medium text-[#E8DFC9] hover:bg-[#211F1A] hover:border-[#777263] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#AFA58F]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddTxModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </section>

      {/* 2. Filtered Totals Summary Bar */}
      <section
        aria-label="Filtered Ledger Totals"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-[#302F28] bg-[#191916] p-4"
      >
        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Filtered Entries</span>
          <span className="text-lg font-semibold text-[#E8DFC9] tabular-nums font-mono mt-0.5 block">
            {filteredList.length} <span className="text-xs font-normal text-[#AFA58F]">of {transactions.length}</span>
          </span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Total Inflow</span>
          <span className="text-lg font-semibold text-[#C6FF4D] tabular-nums font-mono mt-0.5 block">
            +{formatINR(ledgerTotals.totalInflow, { decimals: 0 })}
          </span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Total Outflow</span>
          <span className="text-lg font-semibold text-[#E8DFC9] tabular-nums font-mono mt-0.5 block">
            -{formatINR(ledgerTotals.totalOutflow, { decimals: 0 })}
          </span>
        </div>

        <div className="p-2">
          <span className="text-[11px] text-[#777263] block">Net Period Balance</span>
          <span
            className={`text-lg font-semibold tabular-nums font-mono mt-0.5 block ${
              ledgerTotals.netBalance >= 0 ? 'text-[#E8DFC9]' : 'text-rose-400'
            }`}
          >
            {formatINR(ledgerTotals.netBalance, { decimals: 0 })}
          </span>
        </div>
      </section>

      {/* 3. Comprehensive Filter & Sort Bar */}
      <section
        aria-label="Filters and Sorting"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-4 space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg border border-[#302F28] bg-[#121210] p-1">
            {['all', 'income', 'expense', 'transfer'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-[#211F1A] text-[#C6FF4D] shadow-xs'
                    : 'text-[#AFA58F] hover:text-[#E8DFC9]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#777263]" />
            <input
              type="text"
              placeholder="Filter by description, merchant..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#302F28] bg-[#121210] pl-8 pr-7 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777263] hover:text-[#E8DFC9]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#302F28]/60 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#777263]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[#302F28] bg-[#121210] px-2.5 py-1 text-xs text-[#E8DFC9] focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Account Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#777263]">Account:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="rounded-lg border border-[#302F28] bg-[#121210] px-2.5 py-1 text-xs text-[#E8DFC9] focus:outline-none"
            >
              <option value="All">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#777263]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-[#302F28] bg-[#121210] px-2.5 py-1 text-xs text-[#E8DFC9] focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {(typeFilter !== 'all' ||
            categoryFilter !== 'All' ||
            accountFilter !== 'All' ||
            globalSearchQuery ||
            sortBy !== 'date-desc') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-medium text-[#C6FF4D] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* 4. Transactions Table */}
      <section aria-label="Transactions Table" className="rounded-xl border border-[#302F28] bg-[#191916] overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Filter className="mx-auto h-8 w-8 text-[#777263] mb-2.5" />
            <h4 className="text-sm font-semibold text-[#E8DFC9]">No matching transactions found</h4>
            <p className="text-xs text-[#AFA58F] mt-1 mb-4">
              Try adjusting your search terms or filters to locate transactions.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-[#302F28] bg-[#211F1A] px-3.5 py-1.5 text-xs font-medium text-[#E8DFC9] hover:bg-[#302F28] cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#302F28] bg-[#121210]/60 text-[#777263]">
                <tr>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Account</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302F28]/50">
                {filteredList.map((tx) => {
                  const Icon = categoryIcons[tx.category] || CreditCard
                  const isIncome = tx.type === 'income'
                  const isExpense = tx.type === 'expense'

                  return (
                    <tr key={tx.id} className="hover:bg-[#211F1A]/40 transition-colors group">
                      {/* Date */}
                      <td className="py-3 px-4 text-[#AFA58F] tabular-nums font-mono whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description & Merchant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28] text-[#AFA58F]">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-[#E8DFC9] block truncate">
                              {tx.title}
                            </span>
                            {tx.merchant && (
                              <span className="text-[10px] text-[#777263] block truncate">
                                {tx.merchant}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-[#121210] text-[#AFA58F] border border-[#302F28]">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 text-[#AFA58F] whitespace-nowrap">
                        {tx.type === 'transfer' ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            {getAccountName(tx.accountId)} <ArrowRightLeft className="h-3 w-3 text-[#777263]" /> {getAccountName(tx.toAccountId)}
                          </span>
                        ) : (
                          <span className="text-[11px]">{getAccountName(tx.accountId)}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold tabular-nums font-mono ${
                            isIncome
                              ? 'text-[#C6FF4D]'
                              : isExpense
                              ? 'text-[#E8DFC9]'
                              : 'text-[#AFA58F]'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatINR(tx.amount, { decimals: 0 })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tx)}
                            aria-label={`Edit ${tx.title}`}
                            className="rounded p-1 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTx(tx)}
                            aria-label={`Delete ${tx.title}`}
                            className="rounded p-1 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- EDIT TRANSACTION MODAL --- */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Edit Transaction</h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
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
                  Description / Merchant
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Type
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Account
                  </label>
                  <select
                    value={editFormData.accountId}
                    onChange={(e) => setEditFormData({ ...editFormData, accountId: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="rounded-lg border border-[#302F28] px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#E8DFC9]">Delete Transaction</h3>
            <p className="text-xs text-[#AFA58F] leading-relaxed">
              Remove <strong className="text-[#E8DFC9]">{deleteConfirmTx.title}</strong> (₹
              {Number(deleteConfirmTx.amount).toLocaleString('en-IN')}) from the ledger? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="rounded-lg border border-[#302F28] bg-transparent px-3 py-1.5 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
