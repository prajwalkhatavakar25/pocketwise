/**
 * Formats a numeric value into Indian Rupees (INR - ₹) with standard Indian numbering grouping.
 * 
 * @param {number} amount - Numeric value
 * @param {Object} [options]
 * @param {number} [options.decimals=2] - Number of fraction digits
 * @returns {string} Formatted INR string, e.g., "₹8,42,650.00"
 */
export function formatINR(amount, options = {}) {
  const { decimals = 2 } = options
  const num = Number(amount) || 0

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Formats a percentage with sign indicator.
 * 
 * @param {number} value
 * @returns {string} E.g., "+14.2%" or "-3.8%"
 */
export function formatPercentage(value) {
  const num = Number(value) || 0
  if (num > 0) return `+${num.toFixed(1)}%`
  if (num < 0) return `${num.toFixed(1)}%`
  return '0.0%'
}

/**
 * Computes savings rate percentage.
 * 
 * @param {number} income 
 * @param {number} expenses 
 * @returns {number} Rounded percentage
 */
export function calculateSavingsRate(income, expenses) {
  if (!income || income <= 0) return 0
  const saved = income - expenses
  return Math.round((saved / income) * 100)
}

/**
 * Evaluates budget progress and threshold status.
 * 
 * @param {number} spent 
 * @param {number} allocated 
 * @returns {{ percentage: number, status: 'safe' | 'warning' | 'exceeded' }}
 */
export function calculateBudgetStatus(spent, allocated) {
  if (!allocated || allocated <= 0) {
    return { percentage: 0, status: 'safe' }
  }
  const percentage = Math.round((spent / allocated) * 100)
  let status = 'safe'
  if (percentage > 100) {
    status = 'exceeded'
  } else if (percentage > 80) {
    status = 'warning'
  }
  return { percentage, status }
}

