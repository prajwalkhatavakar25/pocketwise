import { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardContext } from './context'
import {
  recentTransactions as defaultTransactions,
  savingsGoals as defaultSavingsGoals,
  budgetCategories as defaultBudgetCategories,
  cashFlowHistory,
} from '../data/dashboardData'
import {
  filterTransactions,
  calculateLedgerTotals,
  createTransactionRecord,
  validateTransactionInput,
  toPaise,
  fromPaise,
} from '../utils/transactions'
import {
  createSavingsGoalRecord,
  validateSavingsGoalInput,
} from '../utils/savingsGoals'
import { downloadTransactionsCSV } from '../utils/csvExport'
import { sliceCashFlowByTimeframe } from '../utils/chartTimeframe'

const STORAGE_KEYS = {
  TRANSACTIONS: 'pocketwise_transactions_v2',
  GOALS: 'pocketwise_goals_v2',
  BUDGETS: 'pocketwise_budgets_v2',
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
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
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
  // 1. Central Data States
  const [transactions, setTransactions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, defaultTransactions)
  )
  const [savingsGoals, setSavingsGoals] = useState(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, defaultSavingsGoals)
  )
  const [budgetCategories, setBudgetCategories] = useState(() =>
    loadFromStorage(STORAGE_KEYS.BUDGETS, defaultBudgetCategories)
  )

  // 2. Interactive UI States
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState('6M')
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  // Auto-dismiss notification after 3.5 seconds
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => {
      setNotification(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [notification])

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  }, [transactions])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, savingsGoals)
  }, [savingsGoals])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUDGETS, budgetCategories)
  }, [budgetCategories])

  // 3. Derived Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, { search: searchQuery })
  }, [transactions, searchQuery])

  // 4. Derived Cash Flow Chart Data sliced by timeframe
  const activeCashFlowData = useMemo(() => {
    return sliceCashFlowByTimeframe(cashFlowHistory, timeframe)
  }, [timeframe])

  // 5. Dynamic Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totals = calculateLedgerTotals(transactions)
    
    // Baseline demo liquidity anchor: 8,42,650
    const baselineBalancePaise = toPaise(842650)
    // Baseline default transactions net balance
    const defaultTotals = calculateLedgerTotals(defaultTransactions)
    const deltaPaise = toPaise(totals.netBalance) - toPaise(defaultTotals.netBalance)
    const currentBalance = fromPaise(baselineBalancePaise + deltaPaise)

    // Calculate total savings from active savings goals
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
        value: totals.totalInflow,
        change: 5.8,
        changeType: 'positive',
        period: 'vs last month',
      },
      {
        id: 'monthly-expenses',
        title: 'Monthly expenses',
        value: totals.totalOutflow,
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
  }, [transactions, savingsGoals])

  // 6. Action Handlers
  const addTransaction = useCallback((input) => {
    const validation = validateTransactionInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newRecord = createTransactionRecord(input)
    setTransactions((prev) => [newRecord, ...prev])

    // Update matching budget category spent amount if applicable
    if (newRecord.type === 'expense') {
      const addedPaise = toPaise(newRecord.amount)
      setBudgetCategories((prevBudgets) =>
        prevBudgets.map((cat) => {
          // Soft match category name (e.g., 'Groceries' in 'Groceries & household')
          const isMatch =
            cat.category.toLowerCase().includes(newRecord.category.toLowerCase()) ||
            newRecord.category.toLowerCase().includes(cat.category.toLowerCase())
          if (isMatch) {
            const currentSpentPaise = toPaise(cat.spent)
            return {
              ...cat,
              spent: fromPaise(currentSpentPaise + addedPaise),
            }
          }
          return cat
        })
      )
    }

    setNotification({
      type: 'success',
      message: `Transaction recorded: ${newRecord.title} (₹${Number(newRecord.amount).toLocaleString('en-IN')})`,
    })

    return { success: true, transaction: newRecord }
  }, [])

  const addSavingsGoal = useCallback((input) => {
    const validation = validateSavingsGoalInput(input)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const newGoal = createSavingsGoalRecord(input)
    setSavingsGoals((prev) => [...prev, newGoal])

    setNotification({
      type: 'success',
      message: `New goal created: ${newGoal.title} (Target: ₹${Number(newGoal.target).toLocaleString('en-IN')})`,
    })

    return { success: true, goal: newGoal }
  }, [])

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
    // State
    transactions,
    filteredTransactions,
    savingsGoals,
    budgetCategories,
    summaryMetrics,
    searchQuery,
    timeframe,
    activeCashFlowData,
    isAddTxModalOpen,
    isNewGoalModalOpen,
    notification,

    // Setters & Actions
    setSearchQuery,
    clearSearch,
    setTimeframe,
    setIsAddTxModalOpen,
    setIsNewGoalModalOpen,
    addTransaction,
    addSavingsGoal,
    exportStatementCSV,
    dismissNotification,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}


