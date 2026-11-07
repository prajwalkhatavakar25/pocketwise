import { useState } from 'react'
import {
  CalendarClock,
  Plus,
  Check,
  Pause,
  Play,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Building,
  Zap,
  ShoppingBag,
  Film,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

const categoryIcons = {
  Utilities: Zap,
  Housing: Building,
  Entertainment: Film,
  Groceries: ShoppingBag,
  Education: CreditCard,
}

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

/**
 * Recurring Payments Page
 * Subscriptions, bills, and fixed commitments.
 * Supports pause/resume, automatic due date advancement, and single-click 'Mark as Paid'
 * which records a linked expense transaction directly into the ledger.
 */
export default function RecurringPage() {
  const {
    recurringPayments,
    accounts,
    addRecurring,
    editRecurring,
    toggleRecurringActive,
    deleteRecurring,
    payRecurring,
  } = useDashboard()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState(null)
  const [deleteConfirmRecurring, setDeleteConfirmRecurring] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Utilities',
    frequency: 'monthly',
    nextDueDate: '',
    accountId: accounts[0]?.id || '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  // Calculate monthly normalized burden
  const totalMonthlyCommitment = recurringPayments
    .filter((r) => r.isActive)
    .reduce((sum, r) => {
      const amt = Number(r.amount) || 0
      if (r.frequency === 'weekly') return sum + amt * 4.33
      if (r.frequency === 'quarterly') return sum + amt / 3
      if (r.frequency === 'yearly') return sum + amt / 12
      return sum + amt
    }, 0)

  // Find next closest due commitment
  const activeSorted = [...recurringPayments]
    .filter((r) => r.isActive && r.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
  const nextDueItem = activeSorted[0]

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      amount: '',
      category: 'Utilities',
      frequency: 'monthly',
      nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
    })
    setErrorMessage('')
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(formData.amount)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Amount must be a positive number')
      return
    }
    if (!formData.name.trim()) {
      setErrorMessage('Commitment name is required')
      return
    }

    const result = addRecurring({
      name: formData.name.trim(),
      amount: num,
      category: formData.category,
      frequency: formData.frequency,
      nextDueDate: formData.nextDueDate,
      accountId: formData.accountId,
    })

    if (!result.success) {
      setErrorMessage(result.error)
      return
    }

    setIsAddModalOpen(false)
  }

  const handleOpenEdit = (r) => {
    setEditingRecurring(r)
    setFormData({
      name: r.name,
      amount: r.amount,
      category: r.category,
      frequency: r.frequency,
      nextDueDate: r.nextDueDate,
      accountId: r.accountId || accounts[0]?.id || '',
    })
    setErrorMessage('')
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(formData.amount)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Amount must be a positive number')
      return
    }

    editRecurring(editingRecurring.id, {
      name: formData.name.trim(),
      amount: num,
      category: formData.category,
      frequency: formData.frequency,
      nextDueDate: formData.nextDueDate,
      accountId: formData.accountId,
    })

    setEditingRecurring(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmRecurring) return
    deleteRecurring(deleteConfirmRecurring.id)
    setDeleteConfirmRecurring(null)
  }

  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === accId)
    return acc ? acc.name : 'Primary Account'
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action */}
      <section
        aria-label="Recurring Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Recurring Commitments
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Fixed obligations, bills, and subscriptions with automated schedule advancement.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.2]" />
          <span>Add Recurring Bill</span>
        </button>
      </section>

      {/* 2. Summary Metrics */}
      <section
        aria-label="Recurring Commitments Overview"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6"
      >
        <div>
          <span className="text-xs font-medium text-[#777263] uppercase tracking-wider block">
            Normalized Monthly Outflow
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#E8DFC9] tracking-tight tabular-nums font-mono mt-1">
            {formatINR(totalMonthlyCommitment, { decimals: 0 })}
          </div>
          <span className="text-[11px] text-[#AFA58F] mt-1 block">
            Across {recurringPayments.filter((r) => r.isActive).length} active scheduled bills
          </span>
        </div>

        <div className="rounded-lg border border-[#302F28] bg-[#121210] p-4 flex flex-col justify-between">
          <span className="text-xs text-[#777263]">Next Upcoming Due</span>
          {nextDueItem ? (
            <div>
              <span className="text-base font-semibold text-[#E8DFC9] block truncate">
                {nextDueItem.name}
              </span>
              <span className="text-xs text-[#C6FF4D] font-mono mt-0.5 block">
                {formatINR(nextDueItem.amount, { decimals: 0 })} · Due {nextDueItem.nextDueDate}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#777263]">No active upcoming bills</span>
          )}
        </div>

        <div className="rounded-lg border border-[#302F28] bg-[#121210] p-4 flex flex-col justify-between">
          <span className="text-xs text-[#777263]">Active vs Paused</span>
          <div>
            <div className="flex items-center gap-3 text-lg font-semibold tabular-nums font-mono">
              <span className="text-[#C6FF4D]">
                {recurringPayments.filter((r) => r.isActive).length} active
              </span>
              <span className="text-[#302F28]">/</span>
              <span className="text-[#777263]">
                {recurringPayments.filter((r) => !r.isActive).length} paused
              </span>
            </div>
            <span className="text-[11px] text-[#AFA58F]">Schedules Managed</span>
          </div>
        </div>
      </section>

      {/* 3. Recurring Commitments List */}
      <section aria-label="Commitments Ledger" className="space-y-4">
        <h3 className="text-sm font-semibold text-[#E8DFC9] tracking-tight">
          Scheduled Commitments ({recurringPayments.length})
        </h3>

        <div className="space-y-3">
          {recurringPayments.map((item) => {
            const Icon = categoryIcons[item.category] || CalendarClock
            const isPaused = !item.isActive

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  isPaused
                    ? 'border-[#302F28]/60 bg-[#121210] opacity-65'
                    : 'border-[#302F28] bg-[#191916] hover:border-[#777263]/60'
                }`}
              >
                {/* Left: Icon, Name, Category, Frequency, Account */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28] text-[#C6FF4D]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#E8DFC9] truncate">
                        {item.name}
                      </h4>
                      <span className="rounded px-2 py-0.5 text-[10px] font-medium uppercase bg-[#121210] text-[#AFA58F] border border-[#302F28]">
                        {item.frequency}
                      </span>
                      {isPaused && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-[#211F1A] text-[#777263]">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#777263] mt-1">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>Debits from {getAccountName(item.accountId)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Next Due Date, Primary & Secondary Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 sm:gap-5 border-t sm:border-0 border-[#302F28]/40 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-semibold text-[#E8DFC9] tabular-nums font-mono">
                      {formatINR(item.amount, { decimals: 0 })}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#AFA58F] sm:justify-end">
                      <Calendar className="h-3 w-3 text-[#777263]" />
                      <span>Due: {item.nextDueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark as Paid Action */}
                    <button
                      type="button"
                      disabled={isPaused}
                      onClick={() => payRecurring(item.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isPaused
                          ? 'border border-[#302F28] bg-[#121210] text-[#777263] cursor-not-allowed'
                          : 'bg-[#C6FF4D] text-[#0A0A09] hover:bg-[#b8f53d] active:scale-98'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Mark Paid</span>
                    </button>

                    {/* Pause / Resume */}
                    <button
                      type="button"
                      onClick={() => toggleRecurringActive(item.id)}
                      aria-label={isPaused ? 'Resume schedule' : 'Pause schedule'}
                      className="rounded-lg border border-[#302F28] bg-[#121210] p-1.5 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
                    >
                      {isPaused ? <Play className="h-3.5 w-3.5 text-[#C6FF4D]" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      aria-label="Edit commitment"
                      className="rounded-lg border border-[#302F28] bg-[#121210] p-1.5 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmRecurring(item)}
                      aria-label="Delete commitment"
                      className="rounded-lg border border-[#302F28] bg-[#121210] p-1.5 text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* --- ADD RECURRING MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Add Recurring Bill</h3>
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
                  Name / Provider <span className="text-[#C6FF4D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JioFiber Broadband"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    step="1"
                    required
                    placeholder="e.g. 1199"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Debit Account
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
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
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
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
                  Schedule Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT RECURRING MODAL --- */}
      {editingRecurring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Edit Recurring Bill</h3>
              <button
                type="button"
                onClick={() => setEditingRecurring(null)}
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
                  Name / Provider
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    step="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Debit Account
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
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
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setEditingRecurring(null)}
                  className="rounded-lg border border-[#302F28] px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
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

      {/* --- DELETE CONFIRMATION --- */}
      {deleteConfirmRecurring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#E8DFC9]">Delete Recurring Bill</h3>
            <p className="text-xs text-[#AFA58F] leading-relaxed">
              Remove the scheduled commitment for <strong className="text-[#E8DFC9]">{deleteConfirmRecurring.name}</strong>?
              Past ledger payments will remain in your history.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecurring(null)}
                className="rounded-lg border border-[#302F28] px-3 py-1.5 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                Delete Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
