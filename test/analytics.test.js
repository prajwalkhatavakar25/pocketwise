import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  aggregateCategoryExpenses,
  computeCashFlowMetrics,
  generateDeterministicInsights,
} from '../src/utils/analytics.js'

describe('Financial Analytics & Insights Operations', () => {
  const sampleTransactions = [
    { id: '1', amount: 150000, type: 'income', category: 'Income', date: '2026-11-01' },
    { id: '2', amount: 30000, type: 'expense', category: 'Housing & rent', date: '2026-11-02' },
    { id: '3', amount: 15000, type: 'expense', category: 'Groceries & household', date: '2026-11-03' },
    { id: '4', amount: 5000, type: 'expense', category: 'Dining & leisure', date: '2026-11-04' },
    // Transfer must be excluded from expense and income analytics
    { id: '5', amount: 20000, type: 'transfer', category: 'Transfer', date: '2026-11-05' },
  ]

  it('aggregates expenses by category with percentages', () => {
    // Total expenses = 30000 + 15000 + 5000 = 50000
    const categories = aggregateCategoryExpenses(sampleTransactions)
    assert.strictEqual(categories.length, 3)

    const housing = categories.find((c) => c.category === 'Housing & rent')
    assert.strictEqual(housing.total, 30000)
    assert.strictEqual(housing.percentage, 60) // 30k / 50k = 60%
  })

  it('computes cash flow metrics including net savings and savings rate', () => {
    // Income: 150,000, Expenses: 50,000, Net: 100,000, Savings rate: 67%
    const metrics = computeCashFlowMetrics(sampleTransactions)
    assert.strictEqual(metrics.totalIncome, 150000)
    assert.strictEqual(metrics.totalExpenses, 50000)
    assert.strictEqual(metrics.netSavings, 100000)
    assert.strictEqual(metrics.savingsRate, 67)
  })

  it('generates deterministic explainable spending insights', () => {
    const insights = generateDeterministicInsights(sampleTransactions)
    assert.ok(insights.length >= 2, 'Should generate multiple deterministic insights')
    const hasTopCategory = insights.some((i) => i.includes('Housing & rent'))
    assert.ok(hasTopCategory, 'Should identify Housing & rent as highest spending category')
  })
})

