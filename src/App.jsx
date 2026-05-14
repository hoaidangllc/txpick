import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Pricing from './pages/Pricing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Today from './pages/Today.jsx'
import Reminders from './pages/Reminders.jsx'
import Expenses from './pages/Expenses.jsx'
import Bills from './pages/Bills.jsx'
import Summary from './pages/Summary.jsx'
import SmartTools from './pages/SmartTools.jsx'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return <Routes><Route path="/" element={<Landing />} /><Route path="/pricing" element={<Pricing />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} /><Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}><Route path="/today" element={<Today />} /><Route path="/reminders" element={<Reminders />} /><Route path="/expenses" element={<Expenses />} /><Route path="/bills" element={<Bills />} /><Route path="/summary" element={<Summary />} /><Route path="/smart" element={<SmartTools />} /><Route path="/business" element={<Navigate to="/today" replace />} /><Route path="/personal" element={<Navigate to="/today" replace />} /><Route path="/tax" element={<Navigate to="/summary" replace />} /><Route path="/ai" element={<Navigate to="/smart" replace />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
