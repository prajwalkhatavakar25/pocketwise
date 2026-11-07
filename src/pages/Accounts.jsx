import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Landmark,
  Banknote,
  TrendingUp,
  Plus,
  Archive,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'

const typeIconMap = {
  Savings: Landmark,
  Current: Landmark,
  Cash: Banknote,
  Investment: TrendingUp,
  Credit: CreditCard,
}

/**
 * Accounts Management Page
 * Displays total recorded net worth, account breakdown, balance calculations,
 * and enables full CRUD with strict validation and safe deletion guards.
 */
export default function Accounts() {
  const {
    accounts,
    accountBalances,
    totalNetWorth,
    transactions,
    addAccount,
    editAccount,
    toggleArchiveAccount,
    deleteAccount,
  } = useDashboard()

  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    type: 'Savings',
    institution: '',
    accountNumber: '',
    openingBalance: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Savings',
      institution: '',
      accountNumber: '',
      openingBalance: '',
    })
    setErrorMessage('')
  }

  const handleOpenAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (acc) => {
    setEditingAccount(acc)
    setFormData({
      name: acc.name,
      type: acc.type,
      institution: acc.institution,
      accountNumber: acc.accountNumber || '',
      openingBalance: acc.openingBalance,
    })
    setErrorMessage('')
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const result = addAccount({
      name: formData.name.trim(),
      type: formData.type,
      institution: formData.institution.trim(),
      accountNumber: formData.accountNumber.trim(),
      openingBalance: parseFloat(formData.openingBalance) || 0,
    })

    if (!result.success) {
      setErrorMessage(result.error)
      return
    }

    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim()) {
      setErrorMessage('Account name is required')
      return
    }

    const updates = {
      name: formData.name.trim(),
      type: formData.type,
      institution: formData.institution.trim() || formData.name.trim(),
      accountNumber: formData.accountNumber.trim(),
    }

    editAccount(editingAccount.id, updates)
    setEditingAccount(null)
    resetForm()
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmAccount) return
    const result = deleteAccount(deleteConfirmAccount.id)
    if (!result.success) {
      setErrorMessage(result.error)
      return
    }
    setDeleteConfirmAccount(null)
    if (selectedAccountId === deleteConfirmAccount.id) {
      setSelectedAccountId(null)
    }
  }

  // Filtered transactions for selected account drawer
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
  const accountTransactions = selectedAccountId
    ? transactions.filter(
        (tx) => tx.accountId === selectedAccountId || tx.toAccountId === selectedAccountId
      )
    : []

  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const archivedAccounts = accounts.filter((a) => a.isArchived)

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action */}
      <section
        aria-label="Accounts Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Accounts & Net Worth
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Real-time balance derivation across banking, cash, and investment accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.2]" />
          <span>Add Account</span>
        </button>
      </section>

      {/* 2. Total Net Worth Summary Card */}
      <section
        aria-label="Total Net Worth Summary"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-[#777263] uppercase tracking-wider block mb-1">
              Consolidated Net Worth
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-[#E8DFC9] tracking-tight tabular-nums font-mono">
              {formatINR(totalNetWorth, { decimals: 0 })}
            </div>
            <p className="text-xs text-[#AFA58F] mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#C6FF4D]" />
              Calculated dynamically from {activeAccounts.length} active account{activeAccounts.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3">
              <span className="text-[11px] text-[#777263] block">Active Accounts</span>
              <span className="text-lg font-semibold text-[#E8DFC9] tabular-nums font-mono mt-0.5 block">
                {activeAccounts.length}
              </span>
              <span className="text-[10px] text-[#AFA58F]">Bank & Liquid</span>
            </div>

            <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3">
              <span className="text-[11px] text-[#777263] block">Archived Accounts</span>
              <span className="text-lg font-semibold text-[#AFA58F] tabular-nums font-mono mt-0.5 block">
                {archivedAccounts.length}
              </span>
              <span className="text-[10px] text-[#777263]">Excluded from Net Worth</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-lg border border-[#302F28] bg-[#121210] p-3">
              <span className="text-[11px] text-[#777263] block">Linked Transactions</span>
              <span className="text-lg font-semibold text-[#E8DFC9] tabular-nums font-mono mt-0.5 block">
                {transactions.length}
              </span>
              <span className="text-[10px] text-[#AFA58F]">Historical Ledger</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Active Accounts Grid */}
      <section aria-label="Active Accounts List" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E8DFC9] tracking-tight">
            Active Accounts ({activeAccounts.length})
          </h3>
          <span className="text-xs text-[#777263]">
            Click any account to inspect linked transactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeAccounts.map((acc) => {
            const Icon = typeIconMap[acc.type] || Landmark
            const balance = accountBalances[acc.id] ?? acc.openingBalance
            const isSelected = selectedAccountId === acc.id

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                className={`rounded-xl border p-5 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#C6FF4D] bg-[#211F1A] shadow-lg shadow-black/40'
                    : 'border-[#302F28] bg-[#191916] hover:border-[#777263]/60'
                }`}
              >
                {/* Header: Institution + Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28] text-[#C6FF4D]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#E8DFC9] leading-tight">
                        {acc.name}
                      </h4>
                      <p className="text-[11px] text-[#777263] leading-tight mt-0.5">
                        {acc.institution || acc.institutionName} {(acc.accountNumber || acc.accountNumberMask) ? `· ${acc.accountNumber || acc.accountNumberMask}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-[#121210] text-[#AFA58F] border border-[#302F28]">
                    {acc.type}
                  </span>
                </div>

                {/* Balance Display */}
                <div className="py-2 border-y border-[#302F28]/60 my-3">
                  <span className="text-[10px] text-[#777263] uppercase tracking-wider block">
                    Current Derived Balance
                  </span>
                  <div className="text-xl font-semibold text-[#E8DFC9] tabular-nums font-mono mt-0.5">
                    {formatINR(balance, { decimals: 0 })}
                  </div>
                  <span className="text-[10px] text-[#777263] tabular-nums font-mono">
                    Opening: {formatINR(acc.openingBalance, { decimals: 0 })}
                  </span>
                </div>

                {/* Account Card Actions */}
                <div
                  className="flex items-center justify-between pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(acc)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#AFA58F] hover:text-[#E8DFC9] transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleArchiveAccount(acc.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#AFA58F] hover:text-[#E8DFC9] transition-colors cursor-pointer"
                    >
                      <Archive className="h-3 w-3" />
                      <span>Archive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('')
                        setDeleteConfirmAccount(acc)
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Archived Accounts Section (if any exist) */}
      {archivedAccounts.length > 0 && (
        <section aria-label="Archived Accounts" className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-[#777263] tracking-tight">
            Archived Accounts ({archivedAccounts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-70">
            {archivedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="rounded-xl border border-dashed border-[#302F28] bg-[#121210] p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#AFA58F] line-through">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-[#777263]">({acc.institution})</span>
                  </div>
                  <span className="text-xs text-[#777263] tabular-nums font-mono mt-0.5 block">
                    Last Balance: {formatINR(accountBalances[acc.id] ?? acc.openingBalance, { decimals: 0 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleArchiveAccount(acc.id)}
                    className="rounded border border-[#302F28] bg-[#191916] px-2.5 py-1 text-[11px] text-[#E8DFC9] hover:bg-[#211F1A] transition-colors cursor-pointer"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('')
                      setDeleteConfirmAccount(acc)
                    }}
                    className="rounded border border-[#302F28] bg-[#191916] p-1 text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Selected Account Drill-down Drawer */}
      {selectedAccount && (
        <section
          aria-label="Account Specific Transactions"
          className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#E8DFC9] tracking-tight flex items-center gap-2">
                <span>{selectedAccount.name}</span>
                <span className="text-xs font-normal text-[#AFA58F]">
                  ({accountTransactions.length} recorded transaction{accountTransactions.length === 1 ? '' : 's'})
                </span>
              </h3>
              <p className="text-xs text-[#777263]">
                Transactions where this account acted as the primary or transfer destination.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/transactions?search=${encodeURIComponent(selectedAccount.name)}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#C6FF4D] hover:underline cursor-pointer"
              >
                <span>Full Ledger View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAccountId(null)}
                className="rounded-lg p-1 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {accountTransactions.length === 0 ? (
            <p className="text-xs text-[#777263] py-4 text-center">
              No transactions recorded for this account yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#302F28] text-[#777263]">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302F28]/50">
                  {accountTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#211F1A]/40 transition-colors">
                      <td className="py-2.5 pr-4 text-[#AFA58F] tabular-nums font-mono">{tx.date}</td>
                      <td className="py-2.5 pr-4 text-[#E8DFC9] font-medium">{tx.title}</td>
                      <td className="py-2.5 pr-4 text-[#AFA58F]">{tx.category}</td>
                      <td className="py-2.5 pr-4">
                        <span className="capitalize text-[11px] text-[#777263]">{tx.type}</span>
                      </td>
                      <td
                        className={`py-2.5 text-right font-medium tabular-nums font-mono ${
                          tx.type === 'income' ? 'text-[#C6FF4D]' : 'text-[#E8DFC9]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
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

      {/* --- ADD ACCOUNT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Add New Account</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
                }}
                className="text-[#AFA58F] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Account Name <span className="text-[#C6FF4D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:border-[#777263] focus:outline-none"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Cash">Cash</option>
                    <option value="Investment">Investment</option>
                    <option value="Credit">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 501004821"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#777263] mt-0.5 block">Masked automatically</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Opening Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    resetForm()
                  }}
                  className="rounded-lg border border-[#302F28] bg-transparent px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ACCOUNT MODAL --- */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Edit Account</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null)
                  resetForm()
                }}
                className="text-[#AFA58F] hover:text-[#E8DFC9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:border-[#777263] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:border-[#777263] focus:outline-none"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Cash">Cash</option>
                    <option value="Investment">Investment</option>
                    <option value="Credit">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:border-[#777263] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Masked Account Reference
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:border-[#777263] focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAccount(null)
                    resetForm()
                  }}
                  className="rounded-lg border border-[#302F28] bg-transparent px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] cursor-pointer"
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
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="text-base font-semibold text-[#E8DFC9]">Delete Account</h3>
            </div>

            <p className="text-xs text-[#AFA58F] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#E8DFC9]">{deleteConfirmAccount.name}</strong>?
              If this account has linked transactions, deletion will be blocked to preserve ledger integrity.
            </p>

            {errorMessage && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-2.5 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="rounded-lg border border-[#302F28] bg-transparent px-3 py-1.5 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
