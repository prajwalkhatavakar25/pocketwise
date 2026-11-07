import { toPaise, fromPaise } from './transactions.js'

/**
 * Aggregates expense transactions by category and computes relative percentage distribution.
 * Internal transfers and income are strictly excluded.
 * 
 * @param {Array<Object>} transactions
 * @returns {Array<{ category: string, total: number, percentage: number }>}
 */
export function aggregateCategoryExpenses(transactions = []) {
  const categoryMap = {}
  let totalExpensePaise = 0

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.category) {
      const cat = tx.category.trim()
      const amtPaise = toPaise(tx.amount)
      categoryMap[cat] = (categoryMap[cat] || 0) + amtPaise
      totalExpensePaise += amtPaise
    }
  }

  if (totalExpensePaise <= 0) {
    return []
  }

  const results = Object.entries(categoryMap).map(([category, amtPaise]) => {
    const total = fromPaise(amtPaise)
    const percentage = Math.round((amtPaise / totalExpensePaise) * 100)
    return { category, total, percentage }
  })

  // Sort descending by highest spending
  return results.sort((a, b) => b.total - a.total)
}

/**
 * Computes high-level cash flow metrics (total income, total expenses, net savings, savings rate).
 * 
 * @param {Array<Object>} transactions
 * @returns {Object} Cash flow metrics
 */
export function computeCashFlowMetrics(transactions = []) {
  let incomePaise = 0
  let expensePaise = 0

  for (const tx of transactions) {
    const amtPaise = toPaise(tx.amount)
    if (tx.type === 'income') {
      incomePaise += amtPaise
    } else if (tx.type === 'expense') {
      expensePaise += amtPaise
    }
  }

  const netSavingsPaise = incomePaise - expensePaise
  const savingsRate = incomePaise > 0 ? Math.round((netSavingsPaise / incomePaise) * 100) : 0

  return {
    totalIncome: fromPaise(incomePaise),
    totalExpenses: fromPaise(expensePaise),
    netSavings: fromPaise(netSavingsPaise),
    savingsRate,
  }
}

/**
 * Generates deterministic, explainable financial insights based on actual recorded transactions.
 * 
 * @param {Array<Object>} transactions
 * @returns {Array<string>} List of actionable insight statements
 */
export function generateDeterministicInsights(transactions = []) {
  const insights = []
  const metrics = computeCashFlowMetrics(transactions)
  const categories = aggregateCategoryExpenses(transactions)

  if (categories.length > 0) {
    const top = categories[0]
    insights.push(
      `Largest Outflow: ${top.category} accounts for ${top.percentage}% of total expenses (₹${top.total.toLocaleString('en-IN')}).`
    )
  }

  if (metrics.savingsRate >= 50) {
    insights.push(
      `Strong Capital Accumulation: Your current savings rate is ${metrics.savingsRate}%, well above the 20% standard heuristic.`
    )
  } else if (metrics.savingsRate > 0) {
    insights.push(
      `Healthy Margin: You are retaining ${metrics.savingsRate}% of recorded monthly cash flow as net savings.`
    )
  } else if (metrics.totalIncome > 0 && metrics.savingsRate <= 0) {
    insights.push(
      `Cash Flow Alert: Recorded lifestyle outflow currently meets or exceeds recorded inflow for this period.`
    )
  }

  const diningGroceries = categories.filter((c) =>
    c.category.toLowerCase().includes('dining') || c.category.toLowerCase().includes('groceries')
  )
  const foodPaise = diningGroceries.reduce((sum, c) => sum + toPaise(c.total), 0)
  if (foodPaise > 0 && metrics.totalExpenses > 0) {
    const foodPct = Math.round((foodPaise / toPaise(metrics.totalExpenses)) * 100)
    insights.push(
      `Nutrition & Leisure: Food, dining, and household provisions represent ${foodPct}% of your total lifestyle expenses.`
    )
  }

  return insights
}
