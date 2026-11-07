import { useState, useEffect, useRef } from 'react'
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

const EXPENSE_CATEGORIES = [
  'Housing & rent',
  'Groceries & household',
  'Dining & leisure',
  'Transit & commute',
  'Utilities & connectivity',
  'Investments',
  'Shopping',
  'Health & medical',
  'Other expense',
]

const INCOME_CATEGORIES = [
  'Income',
  'Salary',
  'Client Advisory Retainer',
  'Investment dividends',
  'Freelance & consulting',
  'Other income',
]

export default function AddTransactionModal({ isOpen, onClose }) {
  const { addTransaction } = useDashboard()

  const [type, setType] = useState('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [date, setDate] = useState('2026-11-07')
  const [merchant, setMerchant] = useState('')
  const [errors, setErrors] = useState({})

  const firstInputRef = useRef(null)

  // Auto-focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // Update category default when type toggles
  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
    setErrors((prev) => ({ ...prev, category: undefined }))
  }

  // Keyboard accessibility: Escape key dismisses modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!title.trim()) {
      newErrors.title = 'Description is required'
    }

    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than ₹0'
    }

    if (!category || !category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (!date) {
      newErrors.date = 'Valid date is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = addTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date: date ? `${date}` : undefined,
      merchant: merchant.trim() || (type === 'income' ? 'Direct Deposit' : 'Manual Record'),
    })

    if (result.success) {
      onClose()
    } else if (result.error) {
      setErrors({ form: result.error })
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs transition-opacity"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tx-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl text-[#E8DFC9] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#302F28] pb-4 mb-5">
          <div>
            <h3 id="add-tx-title" className="text-base font-semibold tracking-tight text-[#E8DFC9]">
              Record Transaction
            </h3>
            <p className="text-xs text-[#AFA58F] mt-0.5">
              Add a demonstration entry to your November 2026 workspace
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-medium text-[#AFA58F] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#302F28] bg-[#121210] p-1">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-[#211F1A] text-[#E8DFC9] border border-[#302F28]'
                    : 'text-[#AFA58F] hover:text-[#E8DFC9]'
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5 text-[#AFA58F]" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-[#C6FF4D] text-[#0A0A09] font-semibold'
                    : 'text-[#AFA58F] hover:text-[#E8DFC9]'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Income
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tx-description" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
              Description <span className="text-[#C6FF4D]">*</span>
            </label>
            <input
              id="tx-description"
              ref={firstInputRef}
              type="text"
              placeholder="e.g., Client Consultation, Grocery Basket"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              className={`h-9 w-full rounded-lg border bg-[#121210] px-3 text-xs text-[#E8DFC9] placeholder-[#777263] focus:outline-none transition-colors ${
                errors.title ? 'border-red-500 focus:border-red-500' : 'border-[#302F28] focus:border-[#777263]'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Amount (₹) <span className="text-[#C6FF4D]">*</span>
              </label>
              <input
                id="tx-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="₹ 0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-3 font-mono text-xs tabular-nums text-[#E8DFC9] placeholder-[#777263] focus:outline-none transition-colors ${
                  errors.amount ? 'border-red-500 focus:border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-[11px] text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="tx-category" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Category <span className="text-[#C6FF4D]">*</span>
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-2.5 text-xs text-[#E8DFC9] focus:outline-none transition-colors ${
                  errors.category ? 'border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              >
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat} className="bg-[#191916] text-[#E8DFC9]">
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-[11px] text-red-400">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Date & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-date" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Date <span className="text-[#C6FF4D]">*</span>
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-3 font-mono text-xs text-[#E8DFC9] focus:outline-none transition-colors ${
                  errors.date ? 'border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-[11px] text-red-400">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="tx-merchant" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Merchant / Recipient <span className="text-[10px] text-[#777263]">(Optional)</span>
              </label>
              <input
                id="tx-merchant"
                type="text"
                placeholder="e.g. Swiggy, Amazon, HDFC"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#302F28]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#302F28] px-4 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-[#C6FF4D] px-5 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              Record Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
