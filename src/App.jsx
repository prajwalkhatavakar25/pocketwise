import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import './App.css'

/**
 * Root Application component hosting the primary PocketWise dashboard.
 */
export default function App() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}
