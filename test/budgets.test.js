import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validateBudgetInput,
  createBudgetRecord,
  deriveCategorySpending,
  calculateBudgetUtilization,
} from '../src/utils/budgets.js'

describe('Budget Management Operations', () => {
  const sampleTransactions = [
    { id: 't1', category: 'Groceries & household', amount: 4500, type: 'expense', date: '2026-11-04' },
    { id: 't2', category: 'Groceries & household', amount: 1500, type: 'expense', date: '2026-11-06' },
    // Transfer should NOT count towards groceries
    { id: 't3', category: 'Groceries & household', amount: 3000, type: 'transfer', date: '2026-11-05' },
    // Income should NOT count towards groceries
    { id: 't4', category: 'Groceries & household', amount: 1000, type: 'income', date: '2026-11-02' },
  ]

  it('validates budget inputs correctly', () => {
    assert.strictEqual(validateBudgetInput({ category: '', allocated: 10000 }).isValid, false)
    assert.strictEqual(validateBudgetInput({ category: 'Food', allocated: 0 }).isValid, false)
    assert.strictEqual(validateBudgetInput({ category: 'Food', allocated: -100 }).isValid, false)
    assert.strictEqual(validateBudgetInput({ category: 'Food', allocated: 12000 }).isValid, true)
  })

  it('creates budget record with unique ID and defaults', () => {
    const budget = createBudgetRecord({
      category: 'Health & Fitness',
      allocated: 8000,
    })
    assert.ok(budget.id.startsWith('b-'))
    assert.strictEqual(budget.category, 'Health & Fitness')
    assert.strictEqual(budget.allocated, 8000)
  })

  it('derives actual spending for category strictly from expense transactions', () => {
    // 4500 + 1500 = 6000 (transfers and income are excluded)
    const spent = deriveCategorySpending('Groceries & household', sampleTransactions)
    assert.strictEqual(spent, 6000)
  })

  it('calculates budget utilization, remaining buffer, and status alert thresholds', () => {
    // 6,000 spent out of 10,000 allocated = 60%, safe
    const resSafe = calculateBudgetUtilization(6000, 10000)
    assert.strictEqual(resSafe.percentage, 60)
    assert.strictEqual(resSafe.remaining, 4000)
    assert.strictEqual(resSafe.status, 'safe')

    // 8,500 spent out of 10,000 allocated = 85%, warning
    const resWarn = calculateBudgetUtilization(8500, 10000)
    assert.strictEqual(resWarn.percentage, 85)
    assert.strictEqual(resWarn.status, 'warning')

    // 11,000 spent out of 10,000 allocated = 110%, exceeded
    const resOver = calculateBudgetUtilization(11000, 10000)
    assert.strictEqual(resOver.percentage, 110)
    assert.strictEqual(resOver.remaining, -1000)
    assert.strictEqual(resOver.status, 'exceeded')
  })
})

