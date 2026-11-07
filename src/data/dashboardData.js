/**
 * PocketWise 2.0 Demonstration Financial Dataset
 * Expressed in Indian Rupees (INR - ₹) for November 2026 reporting period.
 * Strictly using demonstration data tokens: Deep Black, Warm Beige & Controlled Neon Lime.
 */

export const summaryMetrics = [
  {
    id: 'total-balance',
    title: 'Total balance',
    value: 842650,
    change: 14.2,
    changeType: 'positive',
    period: 'vs last month',
  },
  {
    id: 'monthly-income',
    title: 'Monthly income',
    value: 185000,
    change: 5.8,
    changeType: 'positive',
    period: 'vs last month',
  },
  {
    id: 'monthly-expenses',
    title: 'Monthly expenses',
    value: 68400,
    change: -3.2,
    changeType: 'positive', // Favorable decrease in expenses
    period: 'vs budget cap',
  },
  {
    id: 'total-savings',
    title: 'Total savings',
    value: 325800,
    change: 18.4,
    changeType: 'positive',
    period: 'year to date',
  },
]

export const cashFlowHistory = [
  { month: 'Jun', income: 165000, expenses: 69000, savings: 96000 },
  { month: 'Jul', income: 170000, expenses: 75000, savings: 95000 },
  { month: 'Aug', income: 175000, expenses: 71000, savings: 104000 },
  { month: 'Sep', income: 180000, expenses: 64000, savings: 116000 },
  { month: 'Oct', income: 182000, expenses: 67000, savings: 115000 },
  { month: 'Nov', income: 185000, expenses: 68400, savings: 116600 },
]

export const recentTransactions = [
  {
    id: 'tx-101',
    title: 'Client Advisory Retainer',
    merchant: 'Direct Bank Deposit',
    category: 'Income',
    date: 'Today, 11:30 AM',
    amount: 125000,
    type: 'income',
    iconName: 'Briefcase',
    status: 'Recorded',
  },
  {
    id: 'tx-102',
    title: 'Residential Mortgage Payment',
    merchant: 'Scheduled Payment',
    category: 'Housing',
    date: 'Yesterday, 09:15 AM',
    amount: 18500,
    type: 'expense',
    iconName: 'Home',
    status: 'Recorded',
  },
  {
    id: 'tx-103',
    title: 'Nifty 50 Index Fund Allocation',
    merchant: 'Automated Investment',
    category: 'Investments',
    date: '05 Nov, 10:00 AM',
    amount: 15000,
    type: 'expense',
    iconName: 'TrendingUp',
    status: 'Recorded',
  },
  {
    id: 'tx-104',
    title: 'Weekly Household Provisions',
    merchant: 'Store Purchase',
    category: 'Groceries',
    date: '04 Nov, 07:45 PM',
    amount: 4620,
    type: 'expense',
    iconName: 'ShoppingBag',
    status: 'Recorded',
  },
  {
    id: 'tx-105',
    title: 'Electricity & Utility Service',
    merchant: 'Utility Provider',
    category: 'Utilities',
    date: '02 Nov, 02:10 PM',
    amount: 2840,
    type: 'expense',
    iconName: 'Zap',
    status: 'Recorded',
  },
  {
    id: 'tx-106',
    title: 'Coffee & Workspace Session',
    merchant: 'Local Cafe',
    category: 'Dining',
    date: '01 Nov, 08:30 PM',
    amount: 680,
    type: 'expense',
    iconName: 'Coffee',
    status: 'Recorded',
  },
]

export const budgetCategories = [
  {
    id: 'b-1',
    category: 'Housing & rent',
    spent: 28500,
    allocated: 35000,
    color: '#C6FF4D',
  },
  {
    id: 'b-2',
    category: 'Groceries & household',
    spent: 14200,
    allocated: 20000,
    color: '#9CCB39',
  },
  {
    id: 'b-3',
    category: 'Dining & leisure',
    spent: 8900,
    allocated: 10000,
    color: '#E8DFC9',
  },
  {
    id: 'b-4',
    category: 'Transit & commute',
    spent: 4800,
    allocated: 8000,
    color: '#AFA58F',
  },
  {
    id: 'b-5',
    category: 'Utilities & connectivity',
    spent: 3400,
    allocated: 6000,
    color: '#657343',
  },
]

export const savingsGoals = [
  {
    id: 'goal-1',
    title: 'Emergency reserve fund',
    description: '6 months basic living costs',
    current: 450000,
    target: 600000,
    targetDate: 'Jun 2027',
    color: '#C6FF4D',
  },
  {
    id: 'goal-2',
    title: 'Long-term equity corpus',
    description: 'Index investment compounding',
    current: 820000,
    target: 1000000,
    targetDate: 'Dec 2026',
    color: '#9CCB39',
  },
  {
    id: 'goal-3',
    title: 'Vehicle acquisition deposit',
    description: 'Planned transport upgrade',
    current: 180000,
    target: 300000,
    targetDate: 'Oct 2027',
    color: '#E8DFC9',
  },
]
