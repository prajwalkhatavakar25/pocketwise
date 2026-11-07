import {
  Menu,
  Search,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
} from 'lucide-react'

/**
 * Header Component
 * Minimal 64px header (#0A0A09) with warm beige typography (#E8DFC9),
 * 4px-grid controls (36px height), and one quiet neon lime primary action (#C6FF4D).
 * 
 * @param {Object} props
 * @param {string} [props.title='Dashboard Overview']
 * @param {() => void} [props.onToggleMobileMenu]
 */
export default function Header({
  title = 'Dashboard Overview',
  onToggleMobileMenu,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#302F28] bg-[#0A0A09]/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#302F28] bg-[#191916] text-[#AFA58F] hover:text-[#E8DFC9] lg:hidden cursor-pointer transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div>
          <h1 className="text-base font-semibold tracking-tight text-[#E8DFC9]">
            {title}
          </h1>
          <p className="hidden text-xs text-[#AFA58F] sm:block">
            Consolidated Personal Wealth & Cash Flow Tracker
          </p>
        </div>
      </div>

      {/* Right: Search, Date Selector, Notifications, Primary Action */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar on 4px grid (h-9 = 36px) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#777263] pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions"
            className="h-9 w-56 xl:w-64 rounded-lg border border-[#302F28] bg-[#191916] pl-9 pr-3 text-xs text-[#E8DFC9] placeholder-[#777263] focus:border-[#777263] focus:outline-none transition-colors"
          />
        </div>

        {/* Global Date Selector */}
        <div className="hidden sm:flex h-9 items-center gap-2 rounded-lg border border-[#302F28] bg-[#191916] px-3 text-xs font-medium text-[#E8DFC9]">
          <Calendar className="h-3.5 w-3.5 text-[#AFA58F]" />
          <span>November 2026</span>
          <ChevronDown className="h-3 w-3 text-[#777263]" />
        </div>

        {/* Notifications Icon with Quiet Status Dot */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#302F28] bg-[#191916] text-[#AFA58F] hover:text-[#E8DFC9] hover:border-[#777263] transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#C6FF4D]" />
        </button>

        {/* Add Transaction Primary Action */}
        <button
          type="button"
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
