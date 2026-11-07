import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Search,
  Bookmark,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  X,
  Award,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

/**
 * Financial Academy Catalog Page
 * Browse, search, filter, and track progress across all 11 financial literacy domains.
 */
export default function AcademyPage() {
  const {
    academyLessons,
    academyCategories,
    completedLessons,
    bookmarkedLessons,
    academyProgressPercentage,
    toggleLessonBookmark,
  } = useDashboard()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewFilter, setViewFilter] = useState('all') // 'all' | 'bookmarked' | 'completed'
  const [searchQuery, setSearchQuery] = useState('')

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let result = [...academyLessons]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory)
    }

    // View filter
    if (viewFilter === 'bookmarked') {
      result = result.filter((l) => bookmarkedLessons.includes(l.id))
    } else if (viewFilter === 'completed') {
      result = result.filter((l) => completedLessons.includes(l.id))
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q) ||
          l.categoryName.toLowerCase().includes(q)
      )
    }

    return result
  }, [academyLessons, selectedCategory, viewFilter, searchQuery, bookmarkedLessons, completedLessons])

  return (
    <div className="space-y-6">
      {/* 1. Academy Overview & Progress Hero */}
      <section
        aria-label="Academy Hero"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-5 sm:p-7 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium bg-[#121210] border border-[#302F28] text-[#C6FF4D] mb-2.5">
              <GraduationCap className="h-4 w-4" />
              <span>Curriculum · 11 Financial Literacy Domains</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-[#E8DFC9]">
              PocketWise Financial Academy
            </h2>
            <p className="text-xs sm:text-sm text-[#AFA58F] mt-1.5 max-w-2xl leading-relaxed">
              Jargon-free, academically grounded modules designed to master Indian personal finance: from banking regulations and index investing to EMI formulas and fraud security.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#121210] border border-[#302F28] rounded-xl p-4 min-w-[260px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#211F1A] border border-[#302F28] text-[#C6FF4D]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] text-[#777263] block">Curriculum Progress</span>
              <div className="text-xl font-bold text-[#C6FF4D] tabular-nums font-mono">
                {academyProgressPercentage}% Complete
              </div>
              <span className="text-[10px] text-[#AFA58F]">
                {completedLessons.length} of {academyLessons.length} lessons finished
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="space-y-1.5 pt-2 border-t border-[#302F28]/60">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#121210] border border-[#302F28]">
            <div
              className="h-full rounded-full bg-[#C6FF4D] transition-all duration-300"
              style={{ width: `${academyProgressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#777263]">
            <span>Continuous learning ledger</span>
            <span>{bookmarkedLessons.length} bookmarked for revision</span>
          </div>
        </div>
      </section>

      {/* 2. Search & Category Filters Bar */}
      <section
        aria-label="Filter Controls"
        className="rounded-xl border border-[#302F28] bg-[#191916] p-4 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#777263]" />
            <input
              type="text"
              placeholder="Search lessons by topic, keyword, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-[#302F28] bg-[#121210] pl-9 pr-8 text-xs text-[#E8DFC9] placeholder-[#777263] focus:outline-none focus:border-[#777263]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777263] hover:text-[#E8DFC9]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* View Filter Toggle (All / Bookmarked / Completed) */}
          <div className="flex items-center gap-1 rounded-lg border border-[#302F28] bg-[#121210] p-1">
            <button
              type="button"
              onClick={() => setViewFilter('all')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewFilter === 'all'
                  ? 'bg-[#211F1A] text-[#C6FF4D] shadow-xs'
                  : 'text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              All ({academyLessons.length})
            </button>
            <button
              type="button"
              onClick={() => setViewFilter('bookmarked')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewFilter === 'bookmarked'
                  ? 'bg-[#211F1A] text-[#C6FF4D] shadow-xs'
                  : 'text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              Saved ({bookmarkedLessons.length})
            </button>
            <button
              type="button"
              onClick={() => setViewFilter('completed')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewFilter === 'completed'
                  ? 'bg-[#211F1A] text-[#C6FF4D] shadow-xs'
                  : 'text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              Completed ({completedLessons.length})
            </button>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-[#302F28]/60 no-scrollbar">
          {academyCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#C6FF4D] text-[#0A0A09] font-semibold'
                  : 'border border-[#302F28] bg-[#121210] text-[#AFA58F] hover:text-[#E8DFC9]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Lessons Cards Grid */}
      <section aria-label="Lessons Grid" className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="rounded-xl border border-[#302F28] bg-[#191916] py-16 text-center px-4">
            <BookOpen className="mx-auto h-8 w-8 text-[#777263] mb-2" />
            <h4 className="text-sm font-semibold text-[#E8DFC9]">No lessons found</h4>
            <p className="text-xs text-[#AFA58F] mt-1 mb-4">
              Try adjusting your search criteria or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all')
                setViewFilter('all')
                setSearchQuery('')
              }}
              className="rounded-lg border border-[#302F28] bg-[#211F1A] px-3.5 py-1.5 text-xs font-medium text-[#E8DFC9] hover:bg-[#302F28] cursor-pointer"
            >
              Reset view
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredLessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id)
              const isBookmarked = bookmarkedLessons.includes(lesson.id)

              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-[#302F28] bg-[#191916] p-5 space-y-4 hover:border-[#777263]/60 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category Badge, Difficulty, Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-[#121210] text-[#AFA58F] border border-[#302F28]">
                          {lesson.categoryName}
                        </span>
                        <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-[#211F1A] text-[#777263]">
                          {lesson.level}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleLessonBookmark(lesson.id)}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                        className={`rounded p-1 transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-[#C6FF4D]'
                            : 'text-[#777263] hover:text-[#E8DFC9]'
                        }`}
                      >
                        <Bookmark className="h-4 w-4" fill={isBookmarked ? '#C6FF4D' : 'none'} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#E8DFC9] leading-snug mt-3">
                      {lesson.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-[#AFA58F] line-clamp-3 leading-relaxed mt-2">
                      {lesson.summary}
                    </p>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-3 border-t border-[#302F28]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[#777263] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.readTime}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[#C6FF4D]">
                          <CheckCircle2 className="h-3 w-3" />
                          Passed
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/academy/${lesson.id}`}
                      className="inline-flex items-center gap-1 rounded bg-[#211F1A] border border-[#302F28] px-3 py-1.5 text-xs font-medium text-[#E8DFC9] hover:border-[#C6FF4D] hover:text-[#C6FF4D] transition-colors"
                    >
                      <span>{isCompleted ? 'Review' : 'Start'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
