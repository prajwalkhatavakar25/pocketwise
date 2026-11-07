/**
 * Utility functions for slicing historical cash flow datasets by timeframe (3M, 6M, 1Y).
 */

/**
 * Slices a chronological cash flow array according to the specified timeframe.
 * 
 * @param {Array<Object>} history - Chronological array of monthly data points
 * @param {string} timeframe - '3M' | '6M' | '1Y'
 * @returns {Array<Object>} Sliced array of data points
 */
export function sliceCashFlowByTimeframe(history = [], timeframe = '6M') {
  if (!Array.isArray(history) || history.length === 0) {
    return []
  }

  switch (timeframe) {
    case '3M':
      return history.slice(-3)
    case '6M':
      return history.slice(-6)
    case '1Y':
      return history.slice(-12)
    default:
      return history.slice(-6)
  }
}

