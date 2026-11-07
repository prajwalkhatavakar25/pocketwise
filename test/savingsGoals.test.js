import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validateSavingsGoalInput,
  calculateGoalCompletion,
  createSavingsGoalRecord,
} from '../src/utils/savingsGoals.js'

describe('Savings Goals Operations', () => {
  it('validates required fields and numerical constraints correctly', () => {
    // Missing title
    assert.strictEqual(
      validateSavingsGoalInput({ title: '', target: 50000 }).isValid,
      false,
      'Title should be required'
    )

    // Invalid target
    assert.strictEqual(
      validateSavingsGoalInput({ title: 'New Car', target: 0 }).isValid,
      false,
      'Target must be greater than zero'
    )
    assert.strictEqual(
      validateSavingsGoalInput({ title: 'New Car', target: -100 }).isValid,
      false,
      'Target cannot be negative'
    )

    // Initial saved cannot exceed target
    assert.strictEqual(
      validateSavingsGoalInput({ title: 'New Car', target: 50000, current: 60000 }).isValid,
      false,
      'Current amount cannot exceed target'
    )

    // Initial saved cannot be negative
    assert.strictEqual(
      validateSavingsGoalInput({ title: 'New Car', target: 50000, current: -50 }).isValid,
      false,
      'Current amount cannot be negative'
    )

    // Valid goal
    assert.strictEqual(
      validateSavingsGoalInput({
        title: 'Emergency Fund',
        target: 200000,
        current: 50000,
        targetDate: 'Dec 2027',
      }).isValid,
      true,
      'Valid goal input must pass validation'
    )
  })

  it('calculates completion percentage with clamping and rounding', () => {
    assert.strictEqual(calculateGoalCompletion(50000, 100000), 50)
    assert.strictEqual(calculateGoalCompletion(33333, 100000), 33)
    assert.strictEqual(calculateGoalCompletion(150000, 100000), 100, 'Should clamp to 100%')
    assert.strictEqual(calculateGoalCompletion(0, 100000), 0)
    assert.strictEqual(calculateGoalCompletion(50000, 0), 0, 'Zero target should safely yield 0%')
  })

  it('creates complete savings goal record with sensible defaults and unique ID', () => {
    const goal = createSavingsGoalRecord({
      title: 'Home Renovation',
      target: 350000,
      current: 70000,
      targetDate: 'Mar 2028',
      description: 'Kitchen and living room upgrade',
    })

    assert.ok(goal.id.startsWith('goal-'))
    assert.strictEqual(goal.title, 'Home Renovation')
    assert.strictEqual(goal.target, 350000)
    assert.strictEqual(goal.current, 70000)
    assert.strictEqual(goal.targetDate, 'Mar 2028')
    assert.strictEqual(goal.description, 'Kitchen and living room upgrade')
    assert.ok(goal.color, 'Should assign a theme accent color')
  })
})

