import { createTransactionRecord } from './transactions.js'

/**
 * Validates recurring payment parameters.
 * 
 * @param {Object} input
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateRecurringInput(input = {}) {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Commitment name is required.' }
  }

  const numAmount = Number(input.amount)
  if (input.amount === undefined || isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Amount must be a valid positive number.' }
  }

  const validFreqs = ['weekly', 'monthly', 'quarterly', 'yearly']
  if (!input.frequency || !validFreqs.includes(input.frequency)) {
    return { isValid: false, error: 'Frequency must be weekly, monthly, quarterly, or yearly.' }
  }

  return { isValid: true }
}

/**
 * Advances a date by frequency cycle.
 * 
 * @param {string} dateString - 'YYYY-MM-DD'
 * @param {'weekly'|'monthly'|'quarterly'|'yearly'} frequency
 * @returns {string} New 'YYYY-MM-DD' date string
 */
export function advanceDueDate(dateString, frequency = 'monthly') {
  const d = new Date(dateString)
  if (isNaN(d.getTime())) {
    return dateString
  }

  switch (frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'quarterly':
      d.setMonth(d.getMonth() + 3)
      break
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1)
      break
    default:
      d.setMonth(d.getMonth() + 1)
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Creates a recurring payment schedule record with unique ID.
 * 
 * @param {Object} input
 * @returns {Object} Complete recurring payment record
 */
export function createRecurringRecord(input = {}) {
  return {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: input.name.trim(),
    amount: Number(input.amount),
    category: input.category || 'Utilities & connectivity',
    frequency: input.frequency || 'monthly',
    nextDueDate: input.nextDueDate || new Date().toISOString().split('T')[0],
    accountId: input.accountId || 'acc-1',
    isActive: true,
    lastPaidDate: null,
  }
}

/**
 * Marks a recurring commitment as paid:
 * 1. Generates one linked expense transaction
 * 2. Advances the next due date
 * 3. Updates lastPaidDate
 * 
 * @param {Object} recurring
 * @returns {{ transaction: Object, updatedRecurring: Object }}
 */
export function markRecurringAsPaid(recurring) {
  const paymentDate = recurring.nextDueDate || new Date().toISOString().split('T')[0]

  const transaction = createTransactionRecord({
    title: `${recurring.name} (Recurring)`,
    amount: recurring.amount,
    category: recurring.category,
    type: 'expense',
    accountId: recurring.accountId,
    merchant: recurring.name,
    date: paymentDate,
  })

  const nextDueDate = advanceDueDate(recurring.nextDueDate, recurring.frequency)

  const updatedRecurring = {
    ...recurring,
    nextDueDate,
    lastPaidDate: paymentDate,
  }

  return { transaction, updatedRecurring }
}
