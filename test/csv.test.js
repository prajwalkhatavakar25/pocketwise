import { describe, it } from 'node:test'
import assert from 'node:assert'
import { serializeTransactionsToCSV } from '../src/utils/csvExport.js'

describe('CSV Serialization & Export Operations', () => {
  const sampleTransactions = [
    {
      id: 'tx-1',
      title: 'Advisory Retainer',
      merchant: 'Direct Bank Deposit',
      category: 'Income',
      date: '07 Nov 2026, 11:30 AM',
      amount: 125000,
      type: 'income',
      status: 'Recorded',
    },
    {
      id: 'tx-2',
      title: 'Household Groceries, Fruits & Veggies',
      merchant: 'Nature\'s Basket "Organic"',
      category: 'Groceries & household',
      date: '05 Nov 2026, 04:15 PM',
      amount: 4620.5,
      type: 'expense',
      status: 'Recorded',
    },
  ]

  it('serializes transactions into valid CSV format with standard headers', () => {
    const csv = serializeTransactionsToCSV(sampleTransactions)
    assert.ok(csv.startsWith('\uFEFF'), 'Should start with UTF-8 BOM for Excel compatibility')
    
    const lines = csv.replace('\uFEFF', '').trim().split('\n')
    assert.strictEqual(lines.length, 3, 'Should have header line + 2 data lines')
    
    const headers = lines[0]
    assert.strictEqual(headers, '"Date","Description","Category","Type","Amount (INR)","Merchant/Recipient","Status"')
  })

  it('escapes fields containing commas, double quotes, and newlines correctly', () => {
    const edgeCaseTransactions = [
      {
        id: 'tx-edge',
        title: 'Item with "Quotes", and commas',
        merchant: 'Store\nLine2',
        category: 'Shopping',
        date: '01 Nov 2026',
        amount: 1999,
        type: 'expense',
        status: 'Recorded',
      },
    ]

    const csv = serializeTransactionsToCSV(edgeCaseTransactions)
    const content = csv.replace('\uFEFF', '')
    
    // Quotes must be escaped as double-double quotes: ""
    assert.ok(content.includes('"Item with ""Quotes"", and commas"'), 'Double quotes and commas must be enclosed and doubled')
    assert.ok(content.includes('"Store\nLine2"'), 'Multiline field must be enclosed in quotes')
  })

  it('handles empty transaction lists gracefully by returning headers only', () => {
    const csv = serializeTransactionsToCSV([])
    const lines = csv.replace('\uFEFF', '').trim().split('\n')
    assert.strictEqual(lines.length, 1, 'Should output only headers for empty array')
    assert.strictEqual(lines[0], '"Date","Description","Category","Type","Amount (INR)","Merchant/Recipient","Status"')
  })
})
