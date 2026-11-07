import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validateRecurringInput,
  createRecurringRecord,
  advanceDueDate,
  markRecurringAsPaid,
} from '../src/utils/recurring.js'

describe('Recurring Payments Operations', () => {
  it('validates recurring payment input parameters', () => {
    assert.strictEqual(validateRecurringInput({ name: '', amount: 1500 }).isValid, false)
    assert.strictEqual(validateRecurringInput({ name: 'Rent', amount: 0 }).isValid, false)
    assert.strictEqual(validateRecurringInput({ name: 'Rent', amount: 20000, frequency: 'invalid' }).isValid, false)
    assert.strictEqual(
      validateRecurringInput({
        name: 'Internet',
        amount: 1499,
        category: 'Utilities',
        frequency: 'monthly',
        nextDueDate: '2026-11-20',
      }).isValid,
      true
    )
  })

  it('creates recurring payment records with generated unique ID and defaults', () => {
    const record = createRecurringRecord({
      name: 'Gym Membership',
      amount: 2500,
      category: 'Health',
      frequency: 'monthly',
      nextDueDate: '2026-12-01',
    })
    assert.strictEqual(record.name, 'Gym Membership')
    assert.strictEqual(record.amount, 2500)
    assert.strictEqual(record.isActive, true)
    assert.match(record.id, /^rec-/)
  })

  it('advances next due date accurately across weekly, monthly, quarterly, yearly frequencies', () => {
    // Monthly: 2026-11-05 -> 2026-12-05
    assert.strictEqual(advanceDueDate('2026-11-05', 'monthly'), '2026-12-05')

    // Quarterly: 2026-11-15 -> 2027-02-15
    assert.strictEqual(advanceDueDate('2026-11-15', 'quarterly'), '2027-02-15')

    // Yearly: 2026-11-01 -> 2027-11-01
    assert.strictEqual(advanceDueDate('2026-11-01', 'yearly'), '2027-11-01')

    // Weekly: 2026-11-07 -> 2026-11-14
    assert.strictEqual(advanceDueDate('2026-11-07', 'weekly'), '2026-11-14')
  })

  it('marks recurring payment as paid, creating one linked expense transaction and advancing schedule', () => {
    const recurring = {
      id: 'rec-1',
      name: 'Gym Membership',
      amount: 2500,
      category: 'Health & Fitness',
      frequency: 'monthly',
      nextDueDate: '2026-11-10',
      accountId: 'acc-1',
      isActive: true,
      lastPaidDate: null,
    }

    const result = markRecurringAsPaid(recurring)
    assert.ok(result.transaction, 'Must generate linked expense transaction')
    assert.strictEqual(result.transaction.title, 'Gym Membership (Recurring)')
    assert.strictEqual(result.transaction.amount, 2500)
    assert.strictEqual(result.transaction.type, 'expense')
    assert.strictEqual(result.transaction.category, 'Health & Fitness')
    assert.strictEqual(result.transaction.accountId, 'acc-1')

    assert.strictEqual(result.updatedRecurring.nextDueDate, '2026-12-10')
    assert.strictEqual(result.updatedRecurring.lastPaidDate, '2026-11-10')
  })
})

