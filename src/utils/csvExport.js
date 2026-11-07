/**
 * Utility functions for exporting transaction ledger data to standard RFC 4180 CSV format.
 */

/**
 * Escapes a single cell value for CSV output.
 * If the value contains commas, quotes, or newlines, it is enclosed in double quotes,
 * and internal double quotes are escaped as double-double quotes ("").
 * 
 * @param {any} value
 * @returns {string} Escaped string
 */
export function escapeCSVCell(value) {
  if (value === null || value === undefined) {
    return '""'
  }
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

/**
 * Serializes an array of transaction records into a CSV string.
 * Prepends a UTF-8 BOM (\uFEFF) to guarantee correct Unicode and Rupee symbol rendering in Excel.
 * 
 * @param {Array<Object>} transactions
 * @returns {string} Complete UTF-8 CSV string
 */
export function serializeTransactionsToCSV(transactions = []) {
  const headers = [
    'Date',
    'Description',
    'Category',
    'Type',
    'Amount (INR)',
    'Merchant/Recipient',
    'Status',
  ]

  const headerLine = headers.map(escapeCSVCell).join(',')
  const rows = transactions.map((tx) => {
    return [
      escapeCSVCell(tx.date || ''),
      escapeCSVCell(tx.title || ''),
      escapeCSVCell(tx.category || ''),
      escapeCSVCell(tx.type || ''),
      escapeCSVCell(tx.amount !== undefined ? tx.amount : 0),
      escapeCSVCell(tx.merchant || ''),
      escapeCSVCell(tx.status || 'Recorded'),
    ].join(',')
  })

  // Prepend UTF-8 BOM (\uFEFF)
  return '\uFEFF' + [headerLine, ...rows].join('\n')
}

/**
 * Initiates a browser file download of the serialized CSV content.
 * Cleans up temporary object URLs immediately to prevent memory leaks.
 * 
 * @param {Array<Object>} transactions
 * @param {string} [filename='PocketWise_Statement_November_2026.csv']
 * @returns {boolean} True if download was triggered
 */
export function downloadTransactionsCSV(transactions = [], filename = 'PocketWise_Statement_November_2026.csv') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  const csvContent = serializeTransactionsToCSV(transactions)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)

  return true
}
