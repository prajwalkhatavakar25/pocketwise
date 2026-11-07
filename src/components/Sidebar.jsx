import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart,
  Target,
  CalendarClock,
  Compass,
  BarChart3,
  GraduationCap,
  Settings,
  HelpCircle,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { name: 'Accounts', to: '/accounts', icon: Wallet },
  { name: 'Transactions', to: '/transactions', icon: CreditCard },
  { name: 'Budgets', to: '/budgets', icon: PieChart },
  { name: 'Savings Goals', to: '/goals', icon: Target },
  { name: 'Recurring Payments', to: '/recurring', icon: CalendarClock },
  { name: 'Financial Planning', to: '/planning', icon: Compass },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Financial Academy', to: '/academy', icon: GraduationCap },
]

/**
 * Sidebar Component
 * 260px navigation sidebar in dark charcoal (#121210) with warm beige labels (#AFA58F)
 * and a single quiet neon lime active indicator (#C6FF4D).
 * 
 * @param {Object} props
 * @param {boolean} [props.isOpen=false] - Mobile drawer visibility
 * @param {() => void} [props.onClose] - Close handler for mobile drawer
 */
export default function Sidebar({ isOpen = false, onClose }) {
  const { setNotification } = useDashboard()

  const handlePhase3Notice = (featureName) => {
    if (setNotification) {
      setNotification({
        type: 'info',
        message: `${featureName} is deferred to Phase 3: Platform Settings & Preferences.`,
      })
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#121210] border-r border-[#302F28] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/90' : '-translate-x-full'
        }`}
      >
        {/* Brand Header on 4px grid (h-16 = 64px) */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#302F28]">
          <div className="flex items-center gap-3">
            {/* Minimal PW Monogram */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0A0A09] border border-[#302F28]">
              <span className="text-xs font-semibold tracking-tight">
                <span className="text-[#E8DFC9]">P</span>
                <span className="text-[#C6FF4D]">W</span>
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-[#E8DFC9] block leading-tight">
                PocketWise
              </span>
              <p className="text-[10px] font-normal text-[#777263] leading-tight mt-0.5">
                Your Money. Your Decisions.
              </p>
            </div>
          </div>

          {/* Close button for mobile screens */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="rounded-lg p-1.5 text-[#AFA58F] hover:bg-[#191916] hover:text-[#E8DFC9] lg:hidden cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          <div>
            <p className="px-3 mb-1.5 text-xs font-medium text-[#777263]">
              Menu
            </p>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => {
                      if (onClose) onClose()
                    }}
                    className={({ isActive }) =>
                      `group flex h-9 w-full items-center justify-between rounded-lg px-3 text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#191916] text-[#E8DFC9] border border-[#302F28]'
                          : 'border border-transparent text-[#AFA58F] hover:bg-[#191916]/60 hover:text-[#E8DFC9]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-[#C6FF4D]'
                                : 'text-[#AFA58F] group-hover:text-[#E8DFC9]'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {isActive && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF4D]" />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-1.5 text-xs font-medium text-[#777263]">
              Preferences
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => handlePhase3Notice('Settings')}
                className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 text-xs font-medium text-[#AFA58F] hover:bg-[#191916]/60 hover:text-[#E8DFC9] transition-colors cursor-pointer text-left"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={() => handlePhase3Notice('Support Desk')}
                className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 text-xs font-medium text-[#AFA58F] hover:bg-[#191916]/60 hover:text-[#E8DFC9] transition-colors cursor-pointer text-left"
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span>Support</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Profile & Demo State Footer */}
        <div className="border-t border-[#302F28] p-3.5 bg-[#121210]">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#302F28] bg-[#191916] p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#211F1A] border border-[#302F28] text-xs font-medium text-[#E8DFC9]">
              PW
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-medium text-[#E8DFC9]">
                  Demo Workspace
                </span>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#C6FF4D]" />
              </div>
              <p className="truncate text-[10px] text-[#777263]">
                Phase 2 Core · Client-only
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
