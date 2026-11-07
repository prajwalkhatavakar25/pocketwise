import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  formatINR,
  formatPercentage,
  calculateSavingsRate,
  calculateBudgetStatus,
} from '../src/utils/formatters.js'

describe('Fintech Currency & Financial Formatters', () => {
  it('formats amounts in Indian Rupees (₹) with Indian digit grouping', () => {
    assert.strictEqual(formatINR(842650), '₹8,42,650.00')
    assert.strictEqual(formatINR(185000, { decimals: 0 }), '₹1,85,000')
    assert.strictEqual(formatINR(0), '₹0.00')
  })

  it('formats positive and negative percentages with appropriate sign', () => {
    assert.strictEqual(formatPercentage(14.2), '+14.2%')
    assert.strictEqual(formatPercentage(-3.8), '-3.8%')
    assert.strictEqual(formatPercentage(0), '0.0%')
  })

  it('correctly calculates savings rate from income and expenses', () => {
    // Income: 1,85,000, Expenses: 68,400 -> Savings: 1,16,600 (63.03%)
    const rate = calculateSavingsRate(185000, 68400)
    assert.strictEqual(rate, 63)
  })

  it('evaluates budget status thresholds correctly', () => {
    // Normal: <= 80%
    const statusNormal = calculateBudgetStatus(5000, 10000)
    assert.strictEqual(statusNormal.percentage, 50)
    assert.strictEqual(statusNormal.status, 'safe')

    // Warning: > 80% and <= 100%
    const statusWarning = calculateBudgetStatus(8500, 10000)
    assert.strictEqual(statusWarning.percentage, 85)
    assert.strictEqual(statusWarning.status, 'warning')

    // Danger / Exceeded: > 100%
    const statusDanger = calculateBudgetStatus(11000, 10000)
    assert.strictEqual(statusDanger.percentage, 110)
    assert.strictEqual(statusDanger.status, 'exceeded')
  })
})

