import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Plus,
  Calendar,
  X,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

/**
 * Header Component
 * Minimal 64px header (#0A0A09) with warm beige typography (#E8DFC9),
 * 4px-grid controls (36px height), live search, and one quiet neon lime primary action (#C6FF4D).
 * 
 * @param {Object} props
 * @param {() => void} [props.onToggleMobileMenu]
 */
export default function Header({ onToggleMobileMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    setIsAddTxModalOpen,
    setNotification,
  } = useDashboard()

  const getHeaderInfo = (pathname) => {
    if (pathname === '/') {
      return {
        title: 'Dashboard Overview',
        subtitle: 'Consolidated Personal Wealth & Cash Flow Tracker',
      }
    }
    if (pathname === '/accounts') {
      return {
        title: 'Accounts & Balances',
        subtitle: 'Manage bank accounts, cash reserves, and track net worth',
      }
    }
    if (pathname === '/transactions') {
      return {
        title: 'Transactions Ledger',
        subtitle: 'Comprehensive income, expense, and transfer records',
      }
    }
    if (pathname === '/budgets') {
      return {
        title: 'Monthly Budgets',
        subtitle: 'Category expenditure limits and real-time variance monitoring',
      }
    }
    if (pathname === '/goals') {
      return {
        title: 'Savings Goals',
        subtitle: 'Milestone-driven savings targets and progress tracking',
      }
    }
    if (pathname === '/recurring') {
      return {
        title: 'Recurring Payments',
        subtitle: 'Subscriptions, bills, and fixed financial commitments',
      }
    }
    if (pathname === '/planning') {
      return {
        title: 'Financial Planning',
        subtitle: 'Safe-to-spend liquidity, emergency reserve & milestone roadmap',
      }
    }
    if (pathname === '/analytics') {
      return {
        title: 'Analytics & Trends',
        subtitle: 'In-depth cash flow trends, category breakdown, and insights',
      }
    }
    if (pathname.startsWith('/academy/')) {
      return {
        title: 'Academy Lesson',
        subtitle: 'Comprehensive curriculum & interactive knowledge check',
      }
    }
    if (pathname === '/academy') {
      return {
        title: 'Financial Academy',
        subtitle: 'Structured, jargon-free curriculum for financial literacy',
      }
    }
    return {
      title: 'PocketWise',
      subtitle: 'Personal Finance Platform',
    }
  }

  const { title, subtitle } = getHeaderInfo(location.pathname)

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && location.pathname !== '/transactions') {
      navigate('/transactions')
    }
  }

  const handleBellClick = () => {
    if (setNotification) {
      setNotification({
        type: 'info',
        message: 'Notification Center is scheduled for Phase 3 release.',
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#302F28] bg-[#0A0A09]/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#302F28] bg-[#191916] text-[#AFA58F] hover:text-[#E8DFC9] lg:hidden cursor-pointer transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight text-[#E8DFC9] truncate">
            {title}
          </h1>
          <p className="hidden text-xs text-[#AFA58F] sm:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Date Indicator, Notifications, Primary Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search Bar on 4px grid (h-9 = 36px) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#777263] pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-9 w-52 xl:w-64 rounded-lg border border-[#302F28] bg-[#191916] pl-9 pr-8 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777263] hover:text-[#E8DFC9] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Global Reporting Period Badge */}
        <div className="hidden sm:flex h-9 items-center gap-2 rounded-lg border border-[#302F28] bg-[#191916] px-3 text-xs font-medium text-[#E8DFC9]">
          <Calendar className="h-3.5 w-3.5 text-[#AFA58F]" />
          <span>November 2026</span>
        </div>

        {/* Notifications Icon with Quiet Status Dot */}
        <button
          type="button"
          onClick={handleBellClick}
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#302F28] bg-[#191916] text-[#AFA58F] hover:text-[#E8DFC9] hover:border-[#777263] transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#C6FF4D]" />
        </button>

        {/* Add Transaction Primary Action */}
        <button
          type="button"
          onClick={() => setIsAddTxModalOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C6FF4D] px-3.5 text-xs font-semibold text-[#0A0A09] shadow-xs hover:bg-[#b8f53d] active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.2]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  )
}
