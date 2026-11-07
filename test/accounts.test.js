import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validateAccountInput,
  createAccountRecord,
  calculateAccountBalance,
  calculateTotalNetWorth,
} from '../src/utils/accounts.js'

describe('Accounts Management Operations', () => {
  const sampleAccounts = [
    {
      id: 'acc-1',
      name: 'HDFC Savings',
      type: 'savings',
      openingBalance: 500000,
      isArchived: false,
    },
    {
      id: 'acc-2',
      name: 'ICICI Current',
      type: 'current',
      openingBalance: 100000,
      isArchived: false,
    },
    {
      id: 'acc-archived',
      name: 'Old Bank Account',
      type: 'savings',
      openingBalance: 5000,
      isArchived: true,
    },
  ]

  const sampleTransactions = [
    { id: 't1', accountId: 'acc-1', amount: 50000, type: 'income' },
    { id: 't2', accountId: 'acc-1', amount: 20000, type: 'expense' },
    // Transfer from acc-1 to acc-2 of ₹15,000
    { id: 't3', accountId: 'acc-1', toAccountId: 'acc-2', amount: 15000, type: 'transfer' },
    { id: 't4', accountId: 'acc-2', amount: 5000, type: 'expense' },
  ]

  it('validates account input values strictly', () => {
    assert.strictEqual(validateAccountInput({ name: '', openingBalance: 1000 }).isValid, false)
    assert.strictEqual(validateAccountInput({ name: 'Salary', openingBalance: -50 }).isValid, false)
    assert.strictEqual(validateAccountInput({ name: 'Salary', openingBalance: 'invalid' }).isValid, false)
    assert.strictEqual(validateAccountInput({ name: 'Salary', openingBalance: 25000, type: 'savings' }).isValid, true)
  })

  it('creates an account record with unique ID and defaults', () => {
    const acc = createAccountRecord({
      name: 'Kotak Wealth',
      type: 'savings',
      institutionName: 'Kotak Mahindra',
      openingBalance: 75000,
    })
    assert.ok(acc.id.startsWith('acc-'))
    assert.strictEqual(acc.name, 'Kotak Wealth')
    assert.strictEqual(acc.openingBalance, 75000)
    assert.strictEqual(acc.isArchived, false)
  })

  it('calculates current balance taking into account income, expenses, and transfers', () => {
    // acc-1: opening 500,000 + 50,000 (income) - 20,000 (expense) - 15,000 (transfer out) = 515,000
    const balanceAcc1 = calculateAccountBalance(sampleAccounts[0], sampleTransactions)
    assert.strictEqual(balanceAcc1, 515000)

    // acc-2: opening 100,000 + 15,000 (transfer in) - 5,000 (expense) = 110,000
    const balanceAcc2 = calculateAccountBalance(sampleAccounts[1], sampleTransactions)
    assert.strictEqual(balanceAcc2, 110000)
  })

  it('calculates total recorded net worth excluding archived accounts', () => {
    // acc-1: 515,000, acc-2: 110,000. Total = 625,000
    const total = calculateTotalNetWorth(sampleAccounts, sampleTransactions)
    assert.strictEqual(total, 625000)
  })
})

