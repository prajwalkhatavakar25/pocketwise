import { toPaise, fromPaise } from './transactions.js'

/**
 * Calculates deterministic Safe-to-Spend discretionary liquidity.
 * 
 * Formula:
 * Discretionary = Math.max(0, availableBalance - committedExpenses - plannedSavings - emergencyReserve)
 * Suggested Weekly Limit = Discretionary / (remainingDays / 7)
 * 
 * @param {Object} params
 * @param {number} params.availableBalance
 * @param {number} [params.committedExpenses=0]
 * @param {number} [params.plannedSavings=0]
 * @param {number} [params.emergencyReserve=0]
 * @param {number} [params.remainingDays=30]
 * @returns {Object} Safe-to-Spend breakdown
 */
export function calculateSafeToSpend({
  availableBalance = 0,
  committedExpenses = 0,
  plannedSavings = 0,
  emergencyReserve = 0,
  remainingDays = 30,
}) {
  const availPaise = toPaise(availableBalance)
  const commitPaise = toPaise(committedExpenses)
  const savingsPaise = toPaise(plannedSavings)
  const reservePaise = toPaise(emergencyReserve)

  const obligationsPaise = commitPaise + savingsPaise + reservePaise
  const netPaise = availPaise - obligationsPaise

  const isDeficit = netPaise < 0
  const discretionaryPaise = Math.max(0, netPaise)
  const discretionaryAmount = fromPaise(discretionaryPaise)

  const days = Math.max(1, Number(remainingDays) || 30)
  const dailyDiscretionaryPaise = discretionaryPaise / days
  const suggestedWeeklyLimit = fromPaise(Math.round(dailyDiscretionaryPaise * 7))

  return {
    availableBalance: Number(availableBalance) || 0,
    committedExpenses: Number(committedExpenses) || 0,
    plannedSavings: Number(plannedSavings) || 0,
    emergencyReserve: Number(emergencyReserve) || 0,
    totalObligations: fromPaise(obligationsPaise),
    discretionaryAmount,
    suggestedWeeklyLimit,
    isDeficit,
    remainingDays: days,
  }
}

/**
 * Computes monthly savings required to reach a target financial milestone.
 * 
 * @param {Object} params
 * @param {number} params.target
 * @param {number} [params.current=0]
 * @param {number} [params.monthsRemaining=12]
 * @returns {number} Monthly contribution in Rupees
 */
export function calculateMonthlySavingsRequired({
  target = 0,
  current = 0,
  monthsRemaining = 12,
}) {
  const targetPaise = toPaise(target)
  const currentPaise = toPaise(current)
  const remainingPaise = Math.max(0, targetPaise - currentPaise)

  const months = Math.max(1, Number(monthsRemaining) || 1)
  const monthlyPaise = Math.ceil(remainingPaise / months)

  return fromPaise(monthlyPaise)
}
