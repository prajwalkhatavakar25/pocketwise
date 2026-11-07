import { toPaise, fromPaise } from './transactions.js'

/**
 * Validates manual financial account input parameters.
 * 
 * @param {Object} input
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateAccountInput(input = {}) {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Account name is required.' }
  }

  const numBalance = Number(input.openingBalance)
  if (input.openingBalance === undefined || isNaN(numBalance) || !isFinite(numBalance) || numBalance < 0) {
    return { isValid: false, error: 'Opening balance must be a valid non-negative number.' }
  }

  const validTypes = ['savings', 'current', 'wallet', 'other']
  if (input.type && !validTypes.includes(input.type)) {
    return { isValid: false, error: 'Account type must be savings, current, wallet, or other.' }
  }

  return { isValid: true }
}

/**
 * Creates a manual account record with defaults.
 * 
 * @param {Object} input
 * @returns {Object} Complete account record
 */
export function createAccountRecord(input = {}) {
  const accountColors = ['#C6FF4D', '#9CCB39', '#E8DFC9', '#AFA58F', '#657343']
  const randomColor = accountColors[Math.floor(Math.random() * accountColors.length)]

  return {
    id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: input.name.trim(),
    type: input.type || 'savings',
    institutionName: input.institutionName ? input.institutionName.trim() : 'Manual Ledger',
    accountNumberMask: input.accountNumberMask ? input.accountNumberMask.trim() : '•••• Manual',
    openingBalance: Number(input.openingBalance) || 0,
    color: input.color || randomColor,
    isArchived: false,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Calculates current recorded balance for an account by applying transactions
 * (income, expenses, and internal transfers) to the opening balance using integer paise.
 * 
 * @param {Object} account
 * @param {Array<Object>} transactions
 * @returns {number} Current balance in Rupees
 */
export function calculateAccountBalance(account, transactions = []) {
  if (!account) return 0
  let balancePaise = toPaise(account.openingBalance || 0)

  for (const tx of transactions) {
    const amountPaise = toPaise(tx.amount)

    // Direct account operations
    if (tx.accountId === account.id) {
      if (tx.type === 'income') {
        balancePaise += amountPaise
      } else if (tx.type === 'expense') {
        balancePaise -= amountPaise
      } else if (tx.type === 'transfer') {
        // Outgoing transfer
        balancePaise -= amountPaise
      }
    }

    // Incoming internal transfer destination
    if (tx.type === 'transfer' && tx.toAccountId === account.id) {
      balancePaise += amountPaise
    }
  }

  return fromPaise(balancePaise)
}

/**
 * Computes total net worth across all non-archived accounts.
 * 
 * @param {Array<Object>} accounts
 * @param {Array<Object>} transactions
 * @returns {number} Total recorded net worth in Rupees
 */
export function calculateTotalNetWorth(accounts = [], transactions = []) {
  let totalNetWorthPaise = 0

  for (const acc of accounts) {
    if (!acc.isArchived) {
      const balance = calculateAccountBalance(acc, transactions)
      totalNetWorthPaise += toPaise(balance)
    }
  }

  return fromPaise(totalNetWorthPaise)
}
