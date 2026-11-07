import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

/**
 * Individual Academy Lesson Detail Page
 * Markdown/prose rendering, structured key takeaways, interactive quiz with instant scoring
 * and pedagogical explanations, plus completion/bookmarking state synchronization.
 */
export default function LessonDetailsPage() {
  const { lessonId } = useParams()
  const {
    academyLessons,
    completedLessons,
    bookmarkedLessons,
    quizResults,
    toggleLessonBookmark,
    toggleLessonComplete,
    submitQuiz,
  } = useDashboard()

  const currentIndex = academyLessons.findIndex((l) => l.id === lessonId)
  const lesson = academyLessons[currentIndex]

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizError, setQuizError] = useState('')

  if (!lesson) {
    return (
      <div className="py-20 text-center space-y-4">
        <BookOpen className="mx-auto h-12 w-12 text-[#777263]" />
        <h2 className="text-lg font-semibold text-[#E8DFC9]">Lesson Not Found</h2>
        <p className="text-xs text-[#AFA58F]">
          The lesson requested does not exist in the curriculum index.
        </p>
        <Link
          to="/academy"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C6FF4D] px-4 py-2 text-xs font-semibold text-[#0A0A09]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Academy</span>
        </Link>
      </div>
    )
  }

  const isCompleted = completedLessons.includes(lesson.id)
  const isBookmarked = bookmarkedLessons.includes(lesson.id)
  const existingQuizResult = quizResults[lesson.id]

  const prevLesson = currentIndex > 0 ? academyLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < academyLessons.length - 1 ? academyLessons[currentIndex + 1] : null

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleSubmitQuiz = (e) => {
    e.preventDefault()
    setQuizError('')

    const unanswered = lesson.quiz.some((q) => selectedAnswers[q.id] === undefined)
    if (unanswered) {
      setQuizError('Please select an answer for all questions before submitting.')
      return
    }

    submitQuiz(lesson.id, selectedAnswers)
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setQuizError('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex items-center justify-between text-xs text-[#AFA58F]">
        <Link
          to="/academy"
          className="inline-flex items-center gap-1.5 hover:text-[#E8DFC9] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Financial Academy</span>
        </Link>

        <span className="hidden sm:inline text-[#777263]">
          Curriculum Lesson {currentIndex + 1} of {academyLessons.length}
        </span>
      </div>

      {/* 2. Lesson Header Hero */}
      <header className="rounded-xl border border-[#302F28] bg-[#191916] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded px-2.5 py-1 text-xs font-medium bg-[#121210] text-[#C6FF4D] border border-[#302F28]">
              {lesson.categoryName}
            </span>
            <span className="rounded px-2.5 py-1 text-xs font-medium bg-[#211F1A] text-[#AFA58F]">
              {lesson.level}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#777263] ml-2">
              <Clock className="h-3.5 w-3.5" />
              {lesson.readTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => toggleLessonBookmark(lesson.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-[#C6FF4D] bg-[#211F1A] text-[#C6FF4D]'
                  : 'border-[#302F28] bg-[#121210] text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={isBookmarked ? '#C6FF4D' : 'none'} />
              <span>{isBookmarked ? 'Bookmarked' : 'Save'}</span>
            </button>

            {/* Mark complete toggle */}
            <button
              type="button"
              onClick={() => toggleLessonComplete(lesson.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isCompleted
                  ? 'border-[#C6FF4D]/40 bg-[#211F1A] text-[#C6FF4D]'
                  : 'border-[#302F28] bg-[#121210] text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#E8DFC9] leading-snug">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#AFA58F] leading-relaxed">
          {lesson.summary}
        </p>
      </header>

      {/* 3. Key Takeaways Callout */}
      {lesson.keyTakeaways && (
        <section
          aria-label="Key Takeaways"
          className="rounded-xl border border-[#302F28] bg-[#121210] p-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8DFC9] uppercase tracking-wider">
            <Award className="h-4 w-4 text-[#C6FF4D]" />
            <span>Key Takeaways & Core Principles</span>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#E8DFC9]">
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <li key={`takeaway-${idx}`} className="flex items-start gap-2.5 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF4D] shrink-0 mt-2" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Lesson Content Body */}
      <article className="rounded-xl border border-[#302F28] bg-[#191916] p-6 sm:p-9 space-y-6 text-[#E8DFC9] leading-relaxed">
        <div className="space-y-5 text-xs sm:text-sm text-[#AFA58F]">
          {lesson.content.trim().split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={`p-${idx}`}
                  className="text-base sm:text-lg font-semibold text-[#E8DFC9] pt-4 first:pt-0"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              )
            }
            if (paragraph.startsWith('- ')) {
              const bullets = paragraph.split('\n')
              return (
                <ul key={`ul-${idx}`} className="space-y-2 pl-4 list-disc text-[#E8DFC9]">
                  {bullets.map((b, bIdx) => (
                    <li key={`b-${bIdx}`}>{b.replace('- ', '')}</li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={`p-${idx}`} className="leading-relaxed">
                {paragraph}
              </p>
            )
          })}
        </div>
      </article>

      {/* 5. Interactive Knowledge Check (Quiz) */}
      {lesson.quiz && (
        <section
          aria-label="Interactive Knowledge Check"
          className="rounded-xl border border-[#302F28] bg-[#191916] p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#302F28]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121210] border border-[#302F28] text-[#C6FF4D]">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#E8DFC9]">
                  Knowledge Check Quiz
                </h3>
                <p className="text-xs text-[#AFA58F]">
                  Verify understanding of this module's fundamental rules.
                </p>
              </div>
            </div>

            {existingQuizResult && (
              <span
                className={`rounded px-3 py-1 text-xs font-semibold border ${
                  existingQuizResult.passed
                    ? 'border-[#C6FF4D]/40 bg-[#211F1A] text-[#C6FF4D]'
                    : 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                }`}
              >
                Score: {existingQuizResult.scorePercentage}% ({existingQuizResult.correctCount}/{existingQuizResult.totalQuestions})
              </span>
            )}
          </div>

          {quizError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
              {quizError}
            </div>
          )}

          <form onSubmit={handleSubmitQuiz} className="space-y-6">
            {lesson.quiz.map((q, qIndex) => {
              const selectedOption = selectedAnswers[q.id]
              const hasSubmitted = !!existingQuizResult

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#302F28] bg-[#121210] p-5 space-y-3.5"
                >
                  <p className="text-xs sm:text-sm font-semibold text-[#E8DFC9]">
                    {qIndex + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedOption === optIdx
                      const isCorrect = q.correctIndex === optIdx
                      let optionBorder = 'border-[#302F28] bg-[#191916]'

                      if (hasSubmitted) {
                        if (isCorrect) {
                          optionBorder = 'border-[#C6FF4D] bg-[#211F1A] text-[#C6FF4D]'
                        } else if (isSelected && !isCorrect) {
                          optionBorder = 'border-rose-500/50 bg-rose-950/20 text-rose-300'
                        }
                      } else if (isSelected) {
                        optionBorder = 'border-[#C6FF4D] bg-[#211F1A]'
                      }

                      return (
                        <label
                          key={`opt-${optIdx}`}
                          className={`flex items-center gap-3 rounded-lg border p-3 text-xs cursor-pointer transition-colors ${optionBorder}`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${q.id}`}
                            value={optIdx}
                            checked={isSelected}
                            onChange={() => handleSelectOption(q.id, optIdx)}
                            className="text-[#C6FF4D] focus:ring-0 cursor-pointer"
                          />
                          <span className="flex-1">{option}</span>
                          {hasSubmitted && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-[#C6FF4D] shrink-0" />
                          )}
                        </label>
                      )
                    })}
                  </div>

                  {/* Pedagogical Explanation */}
                  {hasSubmitted && q.explanation && (
                    <div className="rounded-lg border border-[#302F28] bg-[#191916] p-3 text-xs text-[#AFA58F] space-y-1">
                      <strong className="text-[#E8DFC9] block font-medium">Explanation:</strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex items-center justify-between pt-2">
              {existingQuizResult ? (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="rounded-lg border border-[#302F28] bg-[#121210] px-4 py-2 text-xs font-medium text-[#E8DFC9] hover:bg-[#211F1A] cursor-pointer"
                >
                  Retake Knowledge Check
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="rounded-lg bg-[#C6FF4D] px-5 py-2.5 text-xs font-semibold text-[#0A0A09] hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer"
              >
                Submit Knowledge Check
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 6. Footer Navigation: Previous & Next Lessons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#302F28] text-xs">
        {prevLesson ? (
          <Link
            to={`/academy/${prevLesson.id}`}
            className="flex items-center gap-2 text-[#AFA58F] hover:text-[#E8DFC9] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <span className="text-[10px] text-[#777263] block">Previous</span>
              <span className="font-medium truncate max-w-[180px] sm:max-w-xs block">
                {prevLesson.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            to={`/academy/${nextLesson.id}`}
            className="flex items-center gap-2 text-[#AFA58F] hover:text-[#E8DFC9] transition-colors"
          >
            <div className="text-right">
              <span className="text-[10px] text-[#777263] block">Next Lesson</span>
              <span className="font-medium truncate max-w-[180px] sm:max-w-xs block">
                {nextLesson.title}
              </span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/academy"
            className="flex items-center gap-1.5 text-[#C6FF4D] hover:underline"
          >
            <span>Back to Academy Home</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
