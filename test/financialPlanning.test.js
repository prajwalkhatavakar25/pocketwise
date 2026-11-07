import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  calculateSafeToSpend,
  calculateMonthlySavingsRequired,
} from '../src/utils/planning.js'

describe('Financial Planning & Safe-to-Spend Operations', () => {
  it('calculates deterministic Safe-to-Spend discretionary liquidity correctly', () => {
    // Available balance: ₹5,00,000
    // Committed recurring expenses due in remaining period: ₹45,000
    // Planned monthly savings targets: ₹50,000
    // Emergency reserve buffer: ₹1,00,000
    // Remaining days in month: 20
    const plan = calculateSafeToSpend({
      availableBalance: 500000,
      committedExpenses: 45000,
      plannedSavings: 50000,
      emergencyReserve: 100000,
      remainingDays: 20,
    })

    // Discretionary = 500,000 - 45,000 - 50,000 - 100,000 = 305,000
    assert.strictEqual(plan.discretionaryAmount, 305000)
    // Daily limit = 305,000 / 20 = 15,250. Weekly = 15,250 * 7 = 106,750
    assert.strictEqual(plan.suggestedWeeklyLimit, 106750)
  })

  it('clamps discretionary amount to zero if obligations exceed available balance', () => {
    const plan = calculateSafeToSpend({
      availableBalance: 50000,
      committedExpenses: 60000,
      plannedSavings: 20000,
      emergencyReserve: 25000,
      remainingDays: 15,
    })

    assert.strictEqual(plan.discretionaryAmount, 0)
    assert.strictEqual(plan.suggestedWeeklyLimit, 0)
    assert.strictEqual(plan.isDeficit, true)
  })

  it('calculates required monthly savings contribution for future financial milestones', () => {
    // Target 6,00,000, currently saved 1,50,000 (remaining: 4,50,000) over 15 months
    // Monthly required = 4,50,000 / 15 = 30,000
    const monthlyReq = calculateMonthlySavingsRequired({
      target: 600000,
      current: 150000,
      monthsRemaining: 15,
    })
    assert.strictEqual(monthlyReq, 30000)
  })
})

