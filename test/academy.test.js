import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  evaluateQuizAnswers,
  calculateAcademyProgress,
} from '../src/utils/academy.js'

describe('Financial Academy Operations', () => {
  const sampleQuiz = [
    { id: 'q1', correctIndex: 2 },
    { id: 'q2', correctIndex: 0 },
    { id: 'q3', correctIndex: 1 },
  ]

  it('evaluates quiz submissions with accurate scoring and individual question breakdown', () => {
    // User answered: q1 -> 2 (correct), q2 -> 1 (wrong), q3 -> 1 (correct) = 2/3 (67%)
    const userAnswers = { q1: 2, q2: 1, q3: 1 }
    const result = evaluateQuizAnswers(sampleQuiz, userAnswers)

    assert.strictEqual(result.totalQuestions, 3)
    assert.strictEqual(result.correctCount, 2)
    assert.strictEqual(result.scorePercentage, 67)
    assert.strictEqual(result.passed, true) // Threshold >= 60%
  })

  it('calculates aggregate learning progress across total available curriculum', () => {
    // 2 completed out of 5 total lessons = 40%
    const progress = calculateAcademyProgress(['lesson-1', 'lesson-2'], 5)
    assert.strictEqual(progress, 40)
  })
})

