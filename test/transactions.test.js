import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  filterTransactions,
  calculateLedgerTotals,
  createTransactionRecord,
  validateTransactionInput,
} from '../src/utils/transactions.js'

describe('Transactions Ledger Operations', () => {
  const sampleTransactions = [
    {
      id: 'tx-1',
      title: 'Consulting Retainer',
      merchant: 'Direct Client',
      category: 'Income',
      amount: 100000,
      type: 'income',
    },
    {
      id: 'tx-2',
      title: 'Home Loan EMI',
      merchant: 'HDFC Bank',
      category: 'Housing & Loan',
      amount: 25000,
      type: 'expense',
    },
    {
      id: 'tx-3',
      title: 'Grocery Supplies',
      merchant: 'Nature Basket',
      category: 'Groceries',
      amount: 5000,
      type: 'expense',
    },
  ]

  it('correctly filters transactions by type (income, expense, all)', () => {
    const all = filterTransactions(sampleTransactions, { type: 'all' })
    assert.strictEqual(all.length, 3)

    const incomeOnly = filterTransactions(sampleTransactions, { type: 'income' })
    assert.strictEqual(incomeOnly.length, 1)
    assert.strictEqual(incomeOnly[0].title, 'Consulting Retainer')

    const expenseOnly = filterTransactions(sampleTransactions, { type: 'expense' })
    assert.strictEqual(expenseOnly.length, 2)
  })

  it('filters transactions by search query across title and merchant', () => {
    const searchHdfc = filterTransactions(sampleTransactions, { search: 'hdfc' })
    assert.strictEqual(searchHdfc.length, 1)
    assert.strictEqual(searchHdfc[0].id, 'tx-2')

    const searchRetainer = filterTransactions(sampleTransactions, { search: 'RETAINER' })
    assert.strictEqual(searchRetainer.length, 1)
    assert.strictEqual(searchRetainer[0].id, 'tx-1')
  })

  it('filters transactions by category', () => {
    const groc = filterTransactions(sampleTransactions, { category: 'Groceries' })
    assert.strictEqual(groc.length, 1)
    assert.strictEqual(groc[0].title, 'Grocery Supplies')
  })

  it('calculates totals correctly from a list of transactions', () => {
    const totals = calculateLedgerTotals(sampleTransactions)
    assert.strictEqual(totals.totalInflow, 100000)
    assert.strictEqual(totals.totalOutflow, 30000)
    assert.strictEqual(totals.netBalance, 70000)
  })

  it('validates transaction input fields', () => {
    assert.strictEqual(validateTransactionInput({ title: '', amount: 100 }).isValid, false)
    assert.strictEqual(validateTransactionInput({ title: 'Test', amount: -5 }).isValid, false)
    assert.strictEqual(validateTransactionInput({ title: 'Test', amount: 0 }).isValid, false)
    assert.strictEqual(validateTransactionInput({ title: 'Salary', amount: 50000 }).isValid, true)
  })

  it('creates a formatted transaction record with valid defaults', () => {
    const tx = createTransactionRecord({
      title: 'Freelance Project',
      merchant: 'Upwork Global',
      category: 'Income',
      amount: 45000,
      type: 'income',
    })

    assert.ok(tx.id.startsWith('tx-'))
    assert.strictEqual(tx.title, 'Freelance Project')
    assert.strictEqual(tx.amount, 45000)
    assert.strictEqual(tx.type, 'income')
    assert.strictEqual(tx.status, 'Completed')
    assert.ok(tx.date)
  })
})

