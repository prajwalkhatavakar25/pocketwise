import { toPaise, fromPaise } from './transactions.js'

/**
 * Validates budget input fields.
 * 
 * @param {Object} input
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateBudgetInput(input = {}) {
  if (!input.category || !input.category.trim()) {
    return { isValid: false, error: 'Budget category is required.' }
  }

  const numAllocated = Number(input.allocated)
  if (input.allocated === undefined || isNaN(numAllocated) || !isFinite(numAllocated) || numAllocated <= 0) {
    return { isValid: false, error: 'Budget limit must be a positive number greater than 0.' }
  }

  return { isValid: true }
}

/**
 * Creates a budget record with defaults.
 * 
 * @param {Object} input
 * @returns {Object} Complete budget record
 */
export function createBudgetRecord(input = {}) {
  const budgetColors = ['#C6FF4D', '#9CCB39', '#E8DFC9', '#AFA58F', '#657343']
  const randomColor = budgetColors[Math.floor(Math.random() * budgetColors.length)]

  return {
    id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: input.category.trim(),
    allocated: Number(input.allocated),
    period: input.period || 'monthly',
    color: input.color || randomColor,
  }
}

/**
 * Derives actual spending for a category strictly from expense transactions.
 * Internal transfers and savings allocations are never treated as expenses.
 * 
 * @param {string} category
 * @param {Array<Object>} transactions
 * @returns {number} Total spent in Rupees
 */
export function deriveCategorySpending(category, transactions = []) {
  if (!category || !Array.isArray(transactions)) return 0

  const targetCategory = category.trim().toLowerCase()
  let spentPaise = 0

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.category) {
      const txCategory = tx.category.trim().toLowerCase()
      // Match exact or soft containment (e.g. 'Groceries' in 'Groceries & household')
      if (txCategory === targetCategory || txCategory.includes(targetCategory) || targetCategory.includes(txCategory)) {
        spentPaise += toPaise(tx.amount)
      }
    }
  }

  return fromPaise(spentPaise)
}

/**
 * Calculates budget utilization percentage, remaining buffer, and threshold status.
 * 
 * @param {number} spent
 * @param {number} allocated
 * @returns {{ percentage: number, remaining: number, status: 'safe'|'warning'|'exceeded' }}
 */
export function calculateBudgetUtilization(spent, allocated) {
  const numAllocated = Number(allocated) || 0
  const numSpent = Number(spent) || 0

  if (numAllocated <= 0) {
    return { percentage: 0, remaining: 0, status: 'safe' }
  }

  const percentage = Math.round((numSpent / numAllocated) * 100)
  const remaining = fromPaise(toPaise(numAllocated) - toPaise(numSpent))

  let status = 'safe'
  if (percentage > 100) {
    status = 'exceeded'
  } else if (percentage > 80) {
    status = 'warning'
  }

  return { percentage, remaining, status }
}
