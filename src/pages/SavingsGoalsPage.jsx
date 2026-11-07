import { useState } from 'react'
import {
  Target,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  X,
  History,
  Coins,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'
import { formatINR } from '../utils/formatters'
import { calculateGoalCompletion } from '../utils/savingsGoals'
import { calculateMonthlySavingsRequired } from '../utils/planning'

/**
 * Savings Goals Page
 * Milestone-driven savings tracking with dynamic progress calculation,
 * required monthly contribution formulas, and contribution ledger history.
 */
export default function SavingsGoalsPage() {
  const {
    savingsGoals,
    setIsNewGoalModalOpen,
    editSavingsGoal,
    deleteSavingsGoal,
    addGoalContribution,
  } = useDashboard()

  const [activeGoalForContribution, setActiveGoalForContribution] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null)
  const [historyOpenGoalId, setHistoryOpenGoalId] = useState(null)

  // Contribution Form State
  const [contribData, setContribData] = useState({
    amount: '',
    notes: 'Monthly savings contribution',
    date: new Date().toISOString().split('T')[0],
  })

  // Edit Goal Form State
  const [editFormData, setEditFormData] = useState({
    title: '',
    target: '',
    current: '',
    targetDate: '',
    description: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  // Aggregate Metrics
  const totalSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.current) || 0), 0)
  const totalTarget = savingsGoals.reduce((sum, g) => sum + (Number(g.target) || 0), 0)
  const aggregatePercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const handleOpenContribution = (g) => {
    setActiveGoalForContribution(g)
    setContribData({
      amount: '',
      notes: `Deposit to ${g.title}`,
      date: new Date().toISOString().split('T')[0],
    })
    setErrorMessage('')
  }

  const handleContributionSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const num = parseFloat(contribData.amount)
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Contribution amount must be greater than zero')
      return
    }

    const result = addGoalContribution(activeGoalForContribution.id, {
      amount: num,
      notes: contribData.notes,
      date: contribData.date,
    })

    if (!result.success) {
      setErrorMessage(result.error)
      return
    }

    setActiveGoalForContribution(null)
  }

  const handleOpenEdit = (g) => {
    setEditingGoal(g)
    setEditFormData({
      title: g.title,
      target: g.target,
      current: g.current,
      targetDate: g.targetDate || '',
      description: g.description || '',
    })
    setErrorMessage('')
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const targetNum = parseFloat(editFormData.target)
    const currentNum = parseFloat(editFormData.current)

    if (isNaN(targetNum) || targetNum <= 0) {
      setErrorMessage('Target amount must be a positive number')
      return
    }
    if (isNaN(currentNum) || currentNum < 0) {
      setErrorMessage('Current savings cannot be negative')
      return
    }
    if (!editFormData.title.trim()) {
      setErrorMessage('Goal title is required')
      return
    }

    editSavingsGoal(editingGoal.id, {
      title: editFormData.title.trim(),
      target: targetNum,
      current: currentNum,
      targetDate: editFormData.targetDate,
      description: editFormData.description.trim(),
    })

    setEditingGoal(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmGoal) return
    deleteSavingsGoal(deleteConfirmGoal.id)
    setDeleteConfirmGoal(null)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action */}
      <section
        aria-label="Goals Header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E8DFC9]">
            Savings Goals & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-[#AFA58F] mt-0.5">
            Target capital accumulation, required monthly run-rates, and deposit histories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewGoalModalOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.2]" />
          <span>New Savings Goal</span>
        </button>
      </section>

      {/* 2. Aggregate Summary Metrics Banner */}
      <section
        aria-label="Goals Overview Metrics"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-6"
      >
        <div className="md:col-span-2">
          <span className="text-xs font-medium text-[#777263] uppercase tracking-wider block">
            Total Capital Allocated
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#E8DFC9] tracking-tight tabular-nums font-mono mt-1">
            {formatINR(totalSaved, { decimals: 0 })}
            <span className="text-sm font-normal text-[#AFA58F] font-mono ml-2">
              / {formatINR(totalTarget, { decimals: 0 })}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#121210] border border-[#302F28]">
              <div
                className="h-full rounded-full bg-[#C6FF4D] transition-all duration-300"
                style={{ width: `${Math.min(aggregatePercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#AFA58F]">
              <span className="tabular-nums font-mono">{aggregatePercentage}% milestone achieved</span>
              <span className="text-[#E8DFC9] font-medium tabular-nums font-mono">
                {formatINR(Math.max(0, totalTarget - totalSaved), { decimals: 0 })} remaining
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#302F28] bg-[#121210] p-4 flex flex-col justify-between">
          <span className="text-xs text-[#777263]">Active Goals</span>
          <div>
            <span className="text-2xl font-semibold text-[#E8DFC9] tabular-nums font-mono block">
              {savingsGoals.length}
            </span>
            <span className="text-[11px] text-[#AFA58F]">Financial Milestones</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#302F28] bg-[#121210] p-4 flex flex-col justify-between">
          <span className="text-xs text-[#777263]">Completed</span>
          <div>
            <span className="text-2xl font-semibold text-[#C6FF4D] tabular-nums font-mono block">
              {savingsGoals.filter((g) => g.current >= g.target).length}
            </span>
            <span className="text-[11px] text-[#AFA58F]">Milestones Reached</span>
          </div>
        </div>
      </section>

      {/* 3. Goal Cards Grid */}
      <section aria-label="Savings Goals Cards" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E8DFC9] tracking-tight">
            Target Goals ({savingsGoals.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savingsGoals.map((goal) => {
            const percentage = calculateGoalCompletion(goal.current, goal.target)
            const remaining = Math.max(0, goal.target - goal.current)
            const isCompleted = goal.current >= goal.target

            // Required monthly contribution based on remaining months
            const monthlyRequired = calculateMonthlySavingsRequired({
              target: goal.target,
              current: goal.current,
              monthsRemaining: 12,
            })

            const isHistoryOpen = historyOpenGoalId === goal.id
            const contributions = goal.contributions || []

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-[#302F28] bg-[#191916] p-5 space-y-4 hover:border-[#777263]/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28]">
                        <Target className="h-4 w-4" style={{ color: goal.color || '#C6FF4D' }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#E8DFC9]">{goal.title}</h4>
                        <p className="text-[10px] text-[#777263] line-clamp-1">{goal.description}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                        isCompleted
                          ? 'border-[#C6FF4D]/30 bg-[#211F1A] text-[#C6FF4D]'
                          : 'border-[#302F28] bg-[#121210] text-[#AFA58F]'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#121210]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goal.color || '#C6FF4D',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#AFA58F] tabular-nums font-mono">
                        Saved: <strong className="text-[#E8DFC9]">{formatINR(goal.current, { decimals: 0 })}</strong>
                      </span>
                      <span className="text-[#777263] tabular-nums font-mono">
                        Target: {formatINR(goal.target, { decimals: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Milestone Details */}
                  <div className="rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#AFA58F]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-[#777263]" />
                        Target Deadline:
                      </span>
                      <span className="text-[#E8DFC9] font-mono text-[11px]">{goal.targetDate || '2027-11-30'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#AFA58F]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Coins className="h-3 w-3 text-[#777263]" />
                        Monthly Required:
                      </span>
                      <span className="text-[#C6FF4D] font-mono text-[11px] font-medium">
                        {isCompleted ? 'Goal Achieved!' : `${formatINR(monthlyRequired, { decimals: 0 })} / mo`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#777263] text-[10px] pt-1 border-t border-[#302F28]/40">
                      <span>Remaining to target:</span>
                      <span className="font-mono">{formatINR(remaining, { decimals: 0 })}</span>
                    </div>
                  </div>

                  {/* Collapsible Contribution History */}
                  {isHistoryOpen && (
                    <div className="mt-3 rounded-lg border border-[#302F28] bg-[#121210] p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#777263] font-medium">
                        <span>Contribution Ledger</span>
                        <span>{contributions.length} recorded</span>
                      </div>
                      {contributions.length === 0 ? (
                        <p className="text-[10px] text-[#777263]">No direct deposit logs yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {contributions.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between text-[11px] py-1 border-b border-[#302F28]/40 last:border-0"
                            >
                              <div>
                                <span className="text-[#E8DFC9] block leading-tight">{c.notes}</span>
                                <span className="text-[9px] text-[#777263]">{c.date}</span>
                              </div>
                              <span className="text-[#C6FF4D] font-mono font-medium">
                                +{formatINR(c.amount, { decimals: 0 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-[#302F28]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenContribution(goal)}
                      className="inline-flex items-center gap-1 rounded bg-[#211F1A] border border-[#302F28] px-2.5 py-1 text-[11px] font-medium text-[#C6FF4D] hover:bg-[#302F28] cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Deposit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryOpenGoalId(isHistoryOpen ? null : goal.id)}
                      className="inline-flex items-center gap-1 rounded border border-[#302F28] px-2 py-1 text-[11px] text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
                    >
                      <History className="h-3 w-3" />
                      <span>{isHistoryOpen ? 'Hide' : 'History'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(goal)}
                      aria-label="Edit goal"
                      className="text-[#AFA58F] hover:text-[#E8DFC9] p-1 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmGoal(goal)}
                      aria-label="Delete goal"
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
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

      {/* --- ADD CONTRIBUTION MODAL --- */}
      {activeGoalForContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">
                Add Deposit to {activeGoalForContribution.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveGoalForContribution(null)}
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

            <form onSubmit={handleContributionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Deposit Amount (₹) <span className="text-[#C6FF4D]">*</span>
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 5000"
                  value={contribData.amount}
                  onChange={(e) => setContribData({ ...contribData, amount: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Deposit Notes / Description
                </label>
                <input
                  type="text"
                  value={contribData.notes}
                  onChange={(e) => setContribData({ ...contribData, notes: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Deposit Date
                </label>
                <input
                  type="date"
                  value={contribData.date}
                  onChange={(e) => setContribData({ ...contribData, date: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setActiveGoalForContribution(null)}
                  className="rounded-lg border border-[#302F28] px-4 py-2 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] cursor-pointer"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT GOAL MODAL --- */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#302F28] mb-4">
              <h3 className="text-base font-semibold text-[#E8DFC9]">Edit Savings Goal</h3>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
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
                  Goal Title
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
                    Target Milestone (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={editFormData.target}
                    onChange={(e) => setEditFormData({ ...editFormData, target: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={editFormData.current}
                    onChange={(e) => setEditFormData({ ...editFormData, current: e.target.value })}
                    className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Target Deadline Date
                </label>
                <input
                  type="date"
                  value={editFormData.targetDate}
                  onChange={(e) => setEditFormData({ ...editFormData, targetDate: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] font-mono focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AFA58F] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-lg border border-[#302F28] bg-[#121210] px-3 py-2 text-xs text-[#E8DFC9] focus:outline-none focus:border-[#777263]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#302F28]">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
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
      {deleteConfirmGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#302F28] bg-[#191916] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#E8DFC9]">Delete Savings Goal</h3>
            <p className="text-xs text-[#AFA58F] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#E8DFC9]">{deleteConfirmGoal.title}</strong>?
              Past ledger transactions will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmGoal(null)}
                className="rounded-lg border border-[#302F28] px-3 py-1.5 text-xs font-medium text-[#AFA58F] hover:bg-[#211F1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
