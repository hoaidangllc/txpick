import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import PageLoader from './components/PageLoader.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Pricing = lazy(() => import('./pages/Pricing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Today = lazy(() => import('./pages/Today.jsx'))
const Reminders = lazy(() => import('./pages/Reminders.jsx'))
const Expenses = lazy(() => import('./pages/Expenses.jsx'))
const Bills = lazy(() => import('./pages/Bills.jsx'))
const Summary = lazy(() => import('./pages/Summary.jsx'))
const SmartTools = lazy(() => import('./pages/SmartTools.jsx'))
const TaxCenter = lazy(() => import('./pages/TaxCenter.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/today" element={<Today />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/tax" element={<TaxCenter />} />
          <Route path="/smart" element={<SmartTools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/business" element={<Navigate to="/today" replace />} />
          <Route path="/personal" element={<Navigate to="/today" replace />} />
          <Route path="/ai" element={<Navigate to="/smart" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
