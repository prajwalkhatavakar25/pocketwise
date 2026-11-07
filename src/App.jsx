import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardProvider } from './context/DashboardContext'
import { useDashboard } from './context/useDashboard'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import SavingsGoalsPage from './pages/SavingsGoalsPage'
import RecurringPage from './pages/RecurringPage'
import FinancialPlanningPage from './pages/FinancialPlanningPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AcademyPage from './pages/AcademyPage'
import LessonDetailsPage from './pages/LessonDetailsPage'
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<SavingsGoalsPage />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/planning" element={<FinancialPlanningPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/academy/:lessonId" element={<LessonDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>

      {/* Global Modals synced with state */}
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
 * Root Application component hosting the primary PocketWise platform with central state
 * and multi-page routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <DashboardShell />
      </DashboardProvider>
    </BrowserRouter>
  )
}
