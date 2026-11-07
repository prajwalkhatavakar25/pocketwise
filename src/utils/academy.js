/**
 * Utility functions for the Financial Academy learning module.
 */

/**
 * Evaluates quiz responses against lesson questions.
 * 
 * @param {Array<Object>} quizQuestions
 * @param {Record<string, number>} userAnswers - e.g. { q1: 2, q2: 0 }
 * @returns {Object} Evaluation summary
 */
export function evaluateQuizAnswers(quizQuestions = [], userAnswers = {}) {
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
    return { totalQuestions: 0, correctCount: 0, scorePercentage: 0, passed: false, details: [] }
  }

  let correctCount = 0
  const details = quizQuestions.map((q) => {
    const selectedIndex = userAnswers[q.id]
    const isCorrect = selectedIndex !== undefined && selectedIndex === q.correctIndex
    if (isCorrect) correctCount++

    return {
      questionId: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    }
  })

  const totalQuestions = quizQuestions.length
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100)
  const passed = scorePercentage >= 60

  return {
    totalQuestions,
    correctCount,
    scorePercentage,
    passed,
    details,
  }
}

/**
 * Computes overall academy progress percentage.
 * 
 * @param {Array<string>} completedLessonIds
 * @param {number} totalLessonsCount
 * @returns {number} Integer percentage
 */
export function calculateAcademyProgress(completedLessonIds = [], totalLessonsCount = 1) {
  const completed = Array.isArray(completedLessonIds) ? completedLessonIds.length : 0
  const total = Math.max(1, Number(totalLessonsCount) || 1)
  return Math.min(100, Math.round((completed / total) * 100))
}

