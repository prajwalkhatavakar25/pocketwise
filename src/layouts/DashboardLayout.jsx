import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

/**
 * DashboardLayout Component
 * Manages responsive layout, mobile sidebar drawer state with body scroll lock,
 * and full-screen view shell adhering to Deep Black (#0A0A09) & Warm Beige (#E8DFC9).
 * 
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export default function DashboardLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Lock body scroll and listen for Escape key when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          setIsMobileSidebarOpen(false)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isMobileSidebarOpen])

  return (
    <div className="min-h-screen bg-[#0A0A09] text-[#E8DFC9] flex overflow-x-hidden">
      {/* Sidebar: Fixed on desktop, sliding drawer with scroll on mobile */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-[1536px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
