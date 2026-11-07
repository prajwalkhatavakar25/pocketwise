import { DashboardProvider } from './context/DashboardContext'
import { useDashboard } from './context/useDashboard'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import AddTransactionModal from './components/AddTransactionModal'
import NewSavingsGoalModal from './components/NewSavingsGoalModal'
import NotificationToast from './components/NotificationToast'
import './App.css'

function DashboardShell() {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    isNewGoalModalOpen,
    setIsNewGoalModalOpen,
  } = useDashboard()

  return (
    <>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>

      {isAddTxModalOpen && (
        <AddTransactionModal
          isOpen={isAddTxModalOpen}
          onClose={() => setIsAddTxModalOpen(false)}
        />
      )}

      {isNewGoalModalOpen && (
        <NewSavingsGoalModal
          isOpen={isNewGoalModalOpen}
          onClose={() => setIsNewGoalModalOpen(false)}
        />
      )}

      <NotificationToast />
    </>
  )
}

/**
 * Root Application component hosting the primary PocketWise dashboard with central state.
 */
export default function App() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  )
}
