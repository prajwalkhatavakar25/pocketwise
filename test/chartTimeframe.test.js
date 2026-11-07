import { describe, it } from 'node:test'
import assert from 'node:assert'
import { sliceCashFlowByTimeframe } from '../src/utils/chartTimeframe.js'

describe('Cash Flow Chart Timeframe Slicing', () => {
  const fullTwelveMonths = [
    { month: 'Dec 25', income: 150000, expenses: 65000, savings: 85000 },
    { month: 'Jan', income: 152000, expenses: 62000, savings: 90000 },
    { month: 'Feb', income: 155000, expenses: 64000, savings: 91000 },
    { month: 'Mar', income: 158000, expenses: 63000, savings: 95000 },
    { month: 'Apr', income: 160000, expenses: 66000, savings: 94000 },
    { month: 'May', income: 162000, expenses: 67000, savings: 95000 },
    { month: 'Jun', income: 165000, expenses: 69000, savings: 96000 },
    { month: 'Jul', income: 170000, expenses: 75000, savings: 95000 },
    { month: 'Aug', income: 175000, expenses: 71000, savings: 104000 },
    { month: 'Sep', income: 180000, expenses: 64000, savings: 116000 },
    { month: 'Oct', income: 182000, expenses: 67000, savings: 115000 },
    { month: 'Nov', income: 185000, expenses: 68400, savings: 116600 },
  ]

  it('slices dataset to latest 3 months when 3M timeframe is requested', () => {
    const sliced = sliceCashFlowByTimeframe(fullTwelveMonths, '3M')
    assert.strictEqual(sliced.length, 3)
    assert.strictEqual(sliced[0].month, 'Sep')
    assert.strictEqual(sliced[1].month, 'Oct')
    assert.strictEqual(sliced[2].month, 'Nov')
  })

  it('slices dataset to latest 6 months when 6M timeframe is requested', () => {
    const sliced = sliceCashFlowByTimeframe(fullTwelveMonths, '6M')
    assert.strictEqual(sliced.length, 6)
    assert.strictEqual(sliced[0].month, 'Jun')
    assert.strictEqual(sliced[5].month, 'Nov')
  })

  it('returns all 12 months when 1Y timeframe is requested', () => {
    const sliced = sliceCashFlowByTimeframe(fullTwelveMonths, '1Y')
    assert.strictEqual(sliced.length, 12)
    assert.strictEqual(sliced[0].month, 'Dec 25')
    assert.strictEqual(sliced[11].month, 'Nov')
  })

  it('defaults gracefully to 6M on unknown or missing timeframe', () => {
    const sliced = sliceCashFlowByTimeframe(fullTwelveMonths, 'UNKNOWN')
    assert.strictEqual(sliced.length, 6)
  })
})
