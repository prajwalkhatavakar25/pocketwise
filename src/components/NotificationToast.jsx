import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useDashboard } from '../context/useDashboard'

export default function NotificationToast() {
  const { notification, dismissNotification } = useDashboard()

  if (!notification) return null

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-[#C6FF4D] shrink-0" />,
    info: <Info className="h-4 w-4 text-[#AFA58F] shrink-0" />,
    error: <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />,
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-[#302F28] bg-[#191916] px-4 py-3 shadow-2xl text-[#E8DFC9] max-w-md animate-in slide-in-from-bottom-5 duration-200"
    >
      {icons[notification.type] || icons.info}
      <p className="text-xs font-medium text-[#E8DFC9] leading-snug">
        {notification.message}
      </p>
      <button
        type="button"
        onClick={dismissNotification}
        aria-label="Dismiss notification"
        className="ml-auto rounded p-1 text-[#AFA58F] hover:bg-[#211F1A] hover:text-[#E8DFC9] transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
