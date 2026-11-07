import { useState, useEffect, useRef } from 'react'
import { X, Target } from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

export default function NewSavingsGoalModal({ isOpen, onClose }) {
  const { addSavingsGoal } = useDashboard()

  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('0')
  const [targetDate, setTargetDate] = useState('Dec 2027')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  const firstInputRef = useRef(null)

  // Auto-focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

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
      newErrors.title = 'Goal name is required'
    }

    const numTarget = Number(target)
    if (!target || isNaN(numTarget) || !isFinite(numTarget) || numTarget <= 0) {
      newErrors.target = 'Target amount must be a valid number greater than ₹0'
    }

    const numCurrent = current !== '' ? Number(current) : 0
    if (isNaN(numCurrent) || !isFinite(numCurrent) || numCurrent < 0) {
      newErrors.current = 'Initial saved amount cannot be negative'
    } else if (numCurrent > numTarget) {
      newErrors.current = 'Initial saved amount cannot exceed target amount'
    }

    if (!targetDate.trim()) {
      newErrors.targetDate = 'Target date is required (e.g. Dec 2027)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = addSavingsGoal({
      title: title.trim(),
      target: numTarget,
      current: numCurrent,
      targetDate: targetDate.trim(),
      description: description.trim() || 'Capital allocation milestone',
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
        aria-labelledby="new-goal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl text-[#E8DFC9] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#302F28] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#211F1A] border border-[#302F28] text-[#C6FF4D]">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 id="new-goal-title" className="text-base font-semibold tracking-tight text-[#E8DFC9]">
                Create Savings Goal
              </h3>
              <p className="text-xs text-[#AFA58F] mt-0.5">
                Set a milestone for capital accumulation
              </p>
            </div>
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
          {/* Goal Name */}
          <div>
            <label htmlFor="goal-name" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
              Goal Name <span className="text-[#C6FF4D]">*</span>
            </label>
            <input
              id="goal-name"
              ref={firstInputRef}
              type="text"
              placeholder="e.g., Real Estate Down Payment, Electric Vehicle"
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

          {/* Target Amount & Initial Saved Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-target" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Target Amount (₹) <span className="text-[#C6FF4D]">*</span>
              </label>
              <input
                id="goal-target"
                type="number"
                step="any"
                min="1"
                placeholder="₹ 5,00,000"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value)
                  if (errors.target) setErrors((prev) => ({ ...prev, target: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-3 font-mono text-xs tabular-nums text-[#E8DFC9] placeholder-[#777263] focus:outline-none transition-colors ${
                  errors.target ? 'border-red-500 focus:border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              />
              {errors.target && (
                <p className="mt-1 text-[11px] text-red-400">{errors.target}</p>
              )}
            </div>

            <div>
              <label htmlFor="goal-current" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Initial Saved Amount (₹)
              </label>
              <input
                id="goal-current"
                type="number"
                step="any"
                min="0"
                placeholder="₹ 0"
                value={current}
                onChange={(e) => {
                  setCurrent(e.target.value)
                  if (errors.current) setErrors((prev) => ({ ...prev, current: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-3 font-mono text-xs tabular-nums text-[#E8DFC9] placeholder-[#777263] focus:outline-none transition-colors ${
                  errors.current ? 'border-red-500 focus:border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              />
              {errors.current && (
                <p className="mt-1 text-[11px] text-red-400">{errors.current}</p>
              )}
            </div>
          </div>

          {/* Target Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-date" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Target Date <span className="text-[#C6FF4D]">*</span>
              </label>
              <input
                id="goal-date"
                type="text"
                placeholder="e.g. Dec 2027, Jun 2028"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value)
                  if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: undefined }))
                }}
                className={`h-9 w-full rounded-lg border bg-[#121210] px-3 text-xs text-[#E8DFC9] placeholder-[#777263] focus:outline-none transition-colors ${
                  errors.targetDate ? 'border-red-500' : 'border-[#302F28] focus:border-[#777263]'
                }`}
              />
              {errors.targetDate && (
                <p className="mt-1 text-[11px] text-red-400">{errors.targetDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="goal-desc" className="block text-xs font-medium text-[#AFA58F] mb-1.5">
                Description <span className="text-[10px] text-[#777263]">(Optional)</span>
              </label>
              <input
                id="goal-desc"
                type="text"
                placeholder="e.g. 12 months horizon"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
