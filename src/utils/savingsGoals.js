/**
 * Utility functions for Savings Goals validation, completion calculations, and record creation.
 */

/**
 * Validates user input for creating a new savings goal.
 * 
 * @param {Object} input
 * @param {string} input.title
 * @param {number|string} input.target
 * @param {number|string} [input.current=0]
 * @param {string} [input.targetDate]
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateSavingsGoalInput(input = {}) {
  if (!input.title || !input.title.trim()) {
    return { isValid: false, error: 'Goal name is required.' }
  }

  const numTarget = Number(input.target)
  if (isNaN(numTarget) || numTarget <= 0) {
    return { isValid: false, error: 'Target amount must be a valid number greater than 0.' }
  }

  const numCurrent = input.current !== undefined && input.current !== '' ? Number(input.current) : 0
  if (isNaN(numCurrent) || numCurrent < 0) {
    return { isValid: false, error: 'Initial saved amount cannot be negative.' }
  }

  if (numCurrent > numTarget) {
    return { isValid: false, error: 'Initial saved amount cannot exceed the target amount.' }
  }

  return { isValid: true }
}

/**
 * Calculates progress percentage toward a target, clamped between 0 and 100%.
 * 
 * @param {number} current
 * @param {number} target
 * @returns {number} Integer percentage
 */
export function calculateGoalCompletion(current, target) {
  const numTarget = Number(target) || 0
  const numCurrent = Number(current) || 0

  if (numTarget <= 0) {
    return 0
  }

  const pct = Math.round((numCurrent / numTarget) * 100)
  return Math.min(100, Math.max(0, pct))
}

/**
 * Creates a formatted savings goal record with unique identifier.
 * 
 * @param {Object} input
 * @returns {Object} Complete savings goal record
 */
export function createSavingsGoalRecord(input = {}) {
  const goalColors = ['#C6FF4D', '#9CCB39', '#E8DFC9', '#AFA58F', '#657343']
  const randomColor = goalColors[Math.floor(Math.random() * goalColors.length)]

  return {
    id: `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: input.title.trim(),
    description: input.description ? input.description.trim() : 'Personal capital milestone',
    current: Number(input.current) || 0,
    target: Number(input.target),
    targetDate: input.targetDate ? input.targetDate.trim() : 'Dec 2027',
    color: input.color || randomColor,
  }
}
