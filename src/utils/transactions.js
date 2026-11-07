/**
 * Utility functions for filtering, searching, and computing ledger statistics.
 */

/**
 * Filters a list of transactions based on criteria: type, category, and search query.
 * 
 * @param {Array<Object>} transactions
 * @param {Object} [criteria]
 * @param {string} [criteria.type='all'] - 'all' | 'income' | 'expense'
 * @param {string} [criteria.category='all']
 * @param {string} [criteria.search='']
 * @returns {Array<Object>} Filtered transactions list
 */
export function filterTransactions(transactions = [], criteria = {}) {
  const { type = 'all', category = 'all', search = '' } = criteria

  return transactions.filter((tx) => {
    // Type filter
    if (type !== 'all' && tx.type !== type) {
      return false
    }

    // Category filter
    if (category !== 'all' && tx.category !== category) {
      return false
    }

    // Search query filter (matches title or merchant case-insensitively)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      const titleMatch = tx.title ? tx.title.toLowerCase().includes(q) : false
      const merchantMatch = tx.merchant ? tx.merchant.toLowerCase().includes(q) : false
      const categoryMatch = tx.category ? tx.category.toLowerCase().includes(q) : false

      if (!titleMatch && !merchantMatch && !categoryMatch) {
        return false
      }
    }

    return true
  })
}

/**
 * Converts a rupee amount to integer paise to eliminate floating-point calculation errors.
 * 
 * @param {number|string} rupees
 * @returns {number} Integer paise
 */
export function toPaise(rupees) {
  const num = Number(rupees) || 0
  return Math.round(num * 100)
}

/**
 * Converts integer paise back to rupee float with two decimals.
 * 
 * @param {number} paise
 * @returns {number} Rupees
 */
export function fromPaise(paise) {
  return (Math.round(paise) || 0) / 100
}

/**
 * Computes aggregated ledger totals (inflow, outflow, and net balance) using integer paise arithmetic.
 * 
 * @param {Array<Object>} transactions
 * @returns {{ totalInflow: number, totalOutflow: number, netBalance: number }}
 */
export function calculateLedgerTotals(transactions = []) {
  let totalInflowPaise = 0
  let totalOutflowPaise = 0

  for (const tx of transactions) {
    const amountPaise = toPaise(tx.amount)
    if (tx.type === 'income') {
      totalInflowPaise += amountPaise
    } else {
      totalOutflowPaise += amountPaise
    }
  }

  return {
    totalInflow: fromPaise(totalInflowPaise),
    totalOutflow: fromPaise(totalOutflowPaise),
    netBalance: fromPaise(totalInflowPaise - totalOutflowPaise),
  }
}

/**
 * Validates transaction input values.
 * 
 * @param {Object} input
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateTransactionInput(input = {}) {
  if (!input.title || !input.title.trim()) {
    return { isValid: false, error: 'Description or title is required.' }
  }

  const numAmount = Number(input.amount)
  if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Amount must be a valid positive number greater than 0.' }
  }

  if (input.category !== undefined && !input.category.trim()) {
    return { isValid: false, error: 'Category is required.' }
  }

  return { isValid: true }
}

/**
 * Creates a clean transaction record with unique ID and current timestamp.
 * 
 * @param {Object} input
 * @returns {Object} Complete transaction record
 */
export function createTransactionRecord(input = {}) {
  const now = new Date()
  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12
  const timeString = `Today, ${formattedHours}:${minutes} ${ampm}`

  const categoryIcons = {
    'Income': 'Briefcase',
    'Housing & Loan': 'Home',
    'Investments': 'TrendingUp',
    'Groceries': 'ShoppingBag',
    'Utilities': 'Zap',
    'Dining': 'Coffee',
    'Travel': 'TrendingUp',
    'Shopping': 'ShoppingBag',
    'Others': 'CreditCard',
  }

  const category = input.category || (input.type === 'income' ? 'Income' : 'Others')

  return {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: input.title.trim(),
    merchant: input.merchant ? input.merchant.trim() : 'Manual Entry',
    category,
    date: input.date || timeString,
    amount: Number(input.amount),
    type: input.type === 'income' ? 'income' : 'expense',
    iconName: categoryIcons[category] || 'CreditCard',
    status: 'Completed',
  }
}
