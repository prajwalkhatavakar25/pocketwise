import { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardContext } from './context'
import {
  recentTransactions as defaultTransactions,
  savingsGoals as defaultSavingsGoals,
  budgetCategories as defaultBudgetCategories,
  initialAccounts,
  initialRecurringPayments,
  cashFlowHistory,
} from '../data/dashboardData'
import {
  academyLessons,
  academyCategories,
} from '../data/academyData'
import {
  filterTransactions,
  calculateLedgerTotals,
  createTransactionRecord,
  validateTransactionInput,
  toPaise,
  fromPaise,
} from '../utils/transactions'
import {
  createAccountRecord,
  validateAccountInput,
  calculateAccountBalance,
  calculateTotalNetWorth,
} from '../utils/accounts'
import {
  createBudgetRecord,
  validateBudgetInput,
  deriveCategorySpending,
  calculateBudgetUtilization,
} from '../utils/budgets'
import {
  createSavingsGoalRecord,
  validateSavingsGoalInput,
} from '../utils/savingsGoals'
import {
  createRecurringRecord,
  validateRecurringInput,
  markRecurringAsPaid,
} from '../utils/recurring'
import {
  calculateSafeToSpend,
  calculateMonthlySavingsRequired,
} from '../utils/planning'
import {
  aggregateCategoryExpenses,
  computeCashFlowMetrics,
  generateDeterministicInsights,
} from '../utils/analytics'
import {
  evaluateQuizAnswers,
  calculateAcademyProgress,
} from '../utils/academy'
import { downloadTransactionsCSV } from '../utils/csvExport'
import { sliceCashFlowByTimeframe } from '../utils/chartTimeframe'

const STORAGE_KEYS = {
  TRANSACTIONS: 'pocketwise_transactions_v2',
  ACCOUNTS: 'pocketwise_accounts_v2',
  GOALS: 'pocketwise_goals_v2',
  BUDGETS: 'pocketwise_budgets_v2',
  RECURRING: 'pocketwise_recurring_v2',
  EMERGENCY_RESERVE: 'pocketwise_reserve_v2',
  ACADEMY_COMPLETED: 'pocketwise_academy_completed_v2',
  ACADEMY_BOOKMARKS: 'pocketwise_academy_bookmarks_v2',
  ACADEMY_QUIZZES: 'pocketwise_academy_quizzes_v2',
}

/**
 * Safely parses localStorage data with fallback and schema verification.
 */
function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (parsed !== null && parsed !== undefined) {
      if (Array.isArray(fallback) && Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
      if (typeof fallback === 'object' && !Array.isArray(fallback) && typeof parsed === 'object') {
        return parsed
      }
      if (typeof fallback === 'number' && typeof parsed === 'number') {
        return parsed
      }
    }
    return fallback
  } catch (err) {
    console.warn(`[PocketWise Storage] Failed to load ${key}, falling back to defaults:`, err)
    return fallback
  }
}

/**
 * Safely persists data to localStorage.
 */
function saveToStorage(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.warn(`[PocketWise Storage] Failed to persist ${key}:`, err)
  }
}

export function DashboardProvider({ children }) {
  // -------------------------------------------------------------
  // 1. Central Core State Entities
  // -------------------------------------------------------------
  const [accounts, setAccounts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ACCOUNTS, initialAccounts)
  )
  const [transactions, setTransactions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, defaultTransactions)
  )
  const [savingsGoals, setSavingsGoals] = useState(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, defaultSavingsGoals)
  )
  const [budgetCategories, setBudgetCategories] = useState(() =>
    loadFromStorage(STORAGE_KEYS.BUDGETS, defaultBudgetCategories)
  )
  const [recurringPayments, setRecurringPayments] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RECURRING, initialRecurringPayments)
  )
  const [emergencyReserve, setEmergencyReserveState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.EMERGENCY_RESERVE, 50000)
  )

  // Financial Academy State
  const [completedLessons, setCompletedLessons] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ACADEMY_COMPLETED, ['banking-basics-101'])
  )
  const [bookmarkedLessons, setBookmarkedLessons] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ACADEMY_BOOKMARKS, ['investing-index-funds-101'])
  )
  const [quizResults, setQuizResults] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ACADEMY_QUIZZES, {})
  )

  // Interactive UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState('6M')
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  // -------------------------------------------------------------
  // 2. Persistence Synchronization
  // -------------------------------------------------------------
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts) }, [accounts])
  useEffect(() => { saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions) }, [transactions])
  useEffect(() => { saveToStorage(STORAGE_KEYS.GOALS, savingsGoals) }, [savingsGoals])
  useEffect(() => { saveToStorage(STORAGE_KEYS.BUDGETS, budgetCategories) }, [budgetCategories])
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECURRING, recurringPayments) }, [recurringPayments])
  useEffect(() => { saveToStorage(STORAGE_KEYS.EMERGENCY_RESERVE, emergencyReserve) }, [emergencyReserve])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACADEMY_COMPLETED, completedLessons) }, [completedLessons])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACADEMY_BOOKMARKS, bookmarkedLessons) }, [bookmarkedLessons])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACADEMY_QUIZZES, quizResults) }, [quizResults])

  // Toast Auto-Dismiss
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => {
      setNotification(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [notification])

  // -------------------------------------------------------------
  // 3. Derived Computations & Relationships
  // -------------------------------------------------------------

  // Total recorded Net Worth across all active accounts
  const totalNetWorth = useMemo(() => {
    return calculateTotalNetWorth(accounts, transactions)
  }, [accounts, transactions])

  // Map of account balances: { [accId]: balance }
  const accountBalances = useMemo(() => {
    const map = {}
    for (const acc of accounts) {
      map[acc.id] = calculateAccountBalance(acc, transactions)
    }
    return map
  }, [accounts, transactions])

  // Derived budget spending for all categories strictly from expense transactions
  const budgetUtilizationList = useMemo(() => {
    return budgetCategories.map((b) => {
      const spent = deriveCategorySpending(b.category, transactions)
      const util = calculateBudgetUtilization(spent, b.allocated)
      return {
        ...b,
        spent,
        percentage: util.percentage,
        remaining: util.remaining,
        status: util.status,
      }
    })
  }, [budgetCategories, transactions])

  // Safe-to-Spend Discretionary Liquidity
  const safeToSpendData = useMemo(() => {
    const availableBalance = totalNetWorth

    // Active recurring commitments due in remainder of period
    const committedExpenses = recurringPayments
      .filter((r) => r.isActive)
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

    // Monthly planned savings requirements across active goals
    const plannedSavings = savingsGoals.reduce((sum, g) => {
      return sum + calculateMonthlySavingsRequired({
        target: g.target,
        current: g.current,
        monthsRemaining: 12,
      })
    }, 0)

    return calculateSafeToSpend({
      availableBalance,
      committedExpenses,
      plannedSavings,
      emergencyReserve,
      remainingDays: 23, // Balance of November 2026
    })
  }, [totalNetWorth, recurringPayments, savingsGoals, emergencyReserve])

  // High-level cash flow metrics and analytics
  const analyticsMetrics = useMemo(() => {
    return computeCashFlowMetrics(transactions)
  }, [transactions])

  const categoryExpensesDistribution = useMemo(() => {
    return aggregateCategoryExpenses(transactions)
  }, [transactions])

  const spendingInsights = useMemo(() => {
    return generateDeterministicInsights(transactions)
  }, [transactions])

  // Academy Progress
  const academyProgressPercentage = useMemo(() => {
    return calculateAcademyProgress(completedLessons, academyLessons.length)
  }, [completedLessons])

  // Filtered transactions for quick search
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, { search: searchQuery })
  }, [transactions, searchQuery])

  // Cash flow chart sliced by timeframe
  const activeCashFlowData = useMemo(() => {
    return sliceCashFlowByTimeframe(cashFlowHistory, timeframe)
  }, [timeframe])

  // Dynamic Dashboard Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totals = calculateLedgerTotals(transactions)
    const defaultTotals = calculateLedgerTotals(defaultTransactions)

    const baselineBalancePaise = toPaise(842650)
    const balanceDeltaPaise = toPaise(totals.netBalance) - toPaise(defaultTotals.netBalance)
    const currentBalance = totalNetWorth > 0 ? totalNetWorth : fromPaise(baselineBalancePaise + balanceDeltaPaise)

    const baselineIncomePaise = toPaise(185000)
    const incomeDeltaPaise = toPaise(totals.totalInflow) - toPaise(defaultTotals.totalInflow)
    const currentIncome = fromPaise(baselineIncomePaise + incomeDeltaPaise)

    const baselineExpensePaise = toPaise(68400)
    const expenseDeltaPaise = toPaise(totals.totalOutflow) - toPaise(defaultTotals.totalOutflow)
    const currentExpenses = fromPaise(baselineExpensePaise + expenseDeltaPaise)

    const totalGoalsSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.current) || 0), 0)

    return [
      {
        id: 'total-balance',
        title: 'Total balance',
        value: Math.max(0, currentBalance),
        change: 14.2,
        changeType: 'positive',
        period: 'vs last month',
      },
      {
        id: 'monthly-income',
        title: 'Monthly income',
        value: currentIncome,
        change: 5.8,
        changeType: 'positive',
        period: 'vs last month',
      },
      {
        id: 'monthly-expenses',
        title: 'Monthly expenses',
        value: currentExpenses,
        change: -3.2,
        changeType: 'positive',
        period: 'vs budget cap',
      },
      {
        id: 'total-savings',
        title: 'Total savings',
        value: totalGoalsSaved > 0 ? totalGoalsSaved : 325800,
        change: 18.4,
        changeType: 'positive',
        period: 'year to date',
      },
    ]
  }, [transactions, savingsGoals, totalNetWorth])

  // -------------------------------------------------------------
  // 4. Action Handlers (CRUD Operations)
  // -------------------------------------------------------------

  // --- Transactions ---
  const addTransaction = useCallback((input) => {
    const validation = validateTransactionInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newRecord = createTransactionRecord(input)
    setTransactions((prev) => [newRecord, ...prev])

    setNotification({
      type: 'success',
      message: `Transaction recorded: ${newRecord.title} (₹${Number(newRecord.amount).toLocaleString('en-IN')})`,
    })

    return { success: true, transaction: newRecord }
  }, [])

  const editTransaction = useCallback((id, updates) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    )
    setNotification({
      type: 'success',
      message: 'Transaction updated successfully',
    })
    return { success: true }
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    setNotification({
      type: 'info',
      message: 'Transaction deleted from ledger',
    })
    return { success: true }
  }, [])

  // --- Accounts ---
  const addAccount = useCallback((input) => {
    const validation = validateAccountInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newAccount = createAccountRecord(input)
    setAccounts((prev) => [...prev, newAccount])

    setNotification({
      type: 'success',
      message: `Account added: ${newAccount.name}`,
    })
    return { success: true, account: newAccount }
  }, [])

  const editAccount = useCallback((id, updates) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    )
    setNotification({
      type: 'success',
      message: 'Account updated successfully',
    })
    return { success: true }
  }, [])

  const toggleArchiveAccount = useCallback((id) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, isArchived: !acc.isArchived } : acc
      )
    )
    setNotification({
      type: 'info',
      message: 'Account archive state updated',
    })
  }, [])

  const deleteAccount = useCallback((id) => {
    // Check if transactions exist for this account
    const hasTransactions = transactions.some((tx) => tx.accountId === id || tx.toAccountId === id)
    if (hasTransactions) {
      return {
        success: false,
        error: 'Cannot delete account with existing transactions. Please archive it instead or reassign transactions.',
      }
    }

    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    setNotification({
      type: 'info',
      message: 'Account deleted successfully',
    })
    return { success: true }
  }, [transactions])

  // --- Budgets ---
  const addBudget = useCallback((input) => {
    const validation = validateBudgetInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newBudget = createBudgetRecord(input)
    setBudgetCategories((prev) => [...prev, newBudget])

    setNotification({
      type: 'success',
      message: `Budget cap created for ${newBudget.category}`,
    })
    return { success: true, budget: newBudget }
  }, [])

  const editBudget = useCallback((id, updates) => {
    setBudgetCategories((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
    setNotification({
      type: 'success',
      message: 'Budget limit updated',
    })
    return { success: true }
  }, [])

  const deleteBudget = useCallback((id) => {
    setBudgetCategories((prev) => prev.filter((b) => b.id !== id))
    setNotification({
      type: 'info',
      message: 'Budget removed',
    })
    return { success: true }
  }, [])

  // --- Savings Goals ---
  const addSavingsGoal = useCallback((input) => {
    const validation = validateSavingsGoalInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newGoal = createSavingsGoalRecord(input)
    setSavingsGoals((prev) => [...prev, newGoal])

    setNotification({
      type: 'success',
      message: `Savings goal created: ${newGoal.title}`,
    })
    return { success: true, goal: newGoal }
  }, [])

  const editSavingsGoal = useCallback((id, updates) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    )
    setNotification({
      type: 'success',
      message: 'Savings goal updated',
    })
    return { success: true }
  }, [])

  const deleteSavingsGoal = useCallback((id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id))
    setNotification({
      type: 'info',
      message: 'Savings goal deleted',
    })
    return { success: true }
  }, [])

  const addGoalContribution = useCallback((goalId, { amount, notes, date }) => {
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Contribution amount must be greater than 0' }
    }

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = fromPaise(toPaise(g.current) + toPaise(numAmount))
          const contribution = {
            id: `c-${Date.now()}`,
            amount: numAmount,
            date: date || new Date().toISOString().split('T')[0],
            notes: notes || 'Goal deposit',
          }
          return {
            ...g,
            current: newCurrent,
            contributions: [...(g.contributions || []), contribution],
          }
        }
        return g
      })
    )

    setNotification({
      type: 'success',
      message: `Contribution of ₹${numAmount.toLocaleString('en-IN')} added to goal!`,
    })
    return { success: true }
  }, [])

  // --- Recurring Payments ---
  const addRecurring = useCallback((input) => {
    const validation = validateRecurringInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newRecurring = createRecurringRecord(input)
    setRecurringPayments((prev) => [...prev, newRecurring])

    setNotification({
      type: 'success',
      message: `Recurring commitment added: ${newRecurring.name}`,
    })
    return { success: true, recurring: newRecurring }
  }, [])

  const editRecurring = useCallback((id, updates) => {
    setRecurringPayments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
    setNotification({
      type: 'success',
      message: 'Recurring commitment updated',
    })
    return { success: true }
  }, [])

  const toggleRecurringActive = useCallback((id) => {
    setRecurringPayments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    )
  }, [])

  const deleteRecurring = useCallback((id) => {
    setRecurringPayments((prev) => prev.filter((r) => r.id !== id))
    setNotification({
      type: 'info',
      message: 'Recurring schedule removed',
    })
    return { success: true }
  }, [])

  const payRecurring = useCallback((id) => {
    const recurring = recurringPayments.find((r) => r.id === id)
    if (!recurring) {
      return { success: false, error: 'Recurring schedule not found' }
    }

    const { transaction, updatedRecurring } = markRecurringAsPaid(recurring)

    // 1. Add linked expense transaction
    setTransactions((prev) => [transaction, ...prev])

    // 2. Advance recurring due date
    setRecurringPayments((prev) =>
      prev.map((r) => (r.id === id ? updatedRecurring : r))
    )

    setNotification({
      type: 'success',
      message: `Paid ₹${recurring.amount.toLocaleString('en-IN')} for ${recurring.name}. Next due: ${updatedRecurring.nextDueDate}`,
    })

    return { success: true, transaction }
  }, [recurringPayments])

  // --- Financial Planning ---
  const setEmergencyReserve = useCallback((amount) => {
    const num = Number(amount)
    if (!isNaN(num) && num >= 0) {
      setEmergencyReserveState(num)
      setNotification({
        type: 'info',
        message: `Emergency reserve target set to ₹${num.toLocaleString('en-IN')}`,
      })
    }
  }, [])

  // --- Academy Learning ---
  const toggleLessonComplete = useCallback((lessonId) => {
    setCompletedLessons((prev) => {
      const exists = prev.includes(lessonId)
      const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      setNotification({
        type: 'success',
        message: exists ? 'Lesson marked uncompleted' : 'Lesson marked as completed!',
      })
      return next
    })
  }, [])

  const toggleLessonBookmark = useCallback((lessonId) => {
    setBookmarkedLessons((prev) => {
      const exists = prev.includes(lessonId)
      const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      setNotification({
        type: 'info',
        message: exists ? 'Removed bookmark' : 'Bookmarked lesson',
      })
      return next
    })
  }, [])

  const submitQuiz = useCallback((lessonId, answers) => {
    const lesson = academyLessons.find((l) => l.id === lessonId)
    if (!lesson || !lesson.quiz) return null

    const result = evaluateQuizAnswers(lesson.quiz, answers)
    setQuizResults((prev) => ({
      ...prev,
      [lessonId]: {
        ...result,
        submittedAt: new Date().toISOString(),
      },
    }))

    if (result.passed) {
      setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))
    }

    setNotification({
      type: result.passed ? 'success' : 'info',
      message: `Quiz completed: ${result.scorePercentage}% score (${result.correctCount}/${result.totalQuestions})`,
    })

    return result
  }, [])

  // --- CSV Export ---
  const exportStatementCSV = useCallback(() => {
    const success = downloadTransactionsCSV(transactions)
    if (success) {
      setNotification({
        type: 'info',
        message: 'PocketWise_Statement_November_2026.csv downloaded successfully',
      })
    }
  }, [transactions])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const dismissNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const value = {
    // Entities
    accounts,
    accountBalances,
    totalNetWorth,
    transactions,
    filteredTransactions,
    budgetCategories,
    budgetUtilizationList,
    savingsGoals,
    recurringPayments,
    emergencyReserve,
    safeToSpendData,
    analyticsMetrics,
    categoryExpensesDistribution,
    spendingInsights,
    academyLessons,
    academyCategories,
    completedLessons,
    bookmarkedLessons,
    quizResults,
    academyProgressPercentage,

    // UI state
    searchQuery,
    timeframe,
    activeCashFlowData,
    summaryMetrics,
    isAddTxModalOpen,
    isNewGoalModalOpen,
    notification,

    // Setters & Actions
    setSearchQuery,
    clearSearch,
    setTimeframe,
    setIsAddTxModalOpen,
    setIsNewGoalModalOpen,
    dismissNotification,
    exportStatementCSV,

    // CRUD Handlers
    addTransaction,
    editTransaction,
    deleteTransaction,
    addAccount,
    editAccount,
    toggleArchiveAccount,
    deleteAccount,
    addBudget,
    editBudget,
    deleteBudget,
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    addGoalContribution,
    addRecurring,
    editRecurring,
    toggleRecurringActive,
    deleteRecurring,
    payRecurring,
    setEmergencyReserve,
    toggleLessonComplete,
    toggleLessonBookmark,
    submitQuiz,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
