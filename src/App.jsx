import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PageLoader from './components/common/PageLoader.jsx'

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

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function ProtectedPage({ children }) {
  return <ProtectedRoute><LazyPage>{children}</LazyPage></ProtectedRoute>
}

export default function App() {
  return (
    <LazyPage>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedPage><Onboarding /></ProtectedPage>} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/today" element={<LazyPage><Today /></LazyPage>} />
          <Route path="/reminders" element={<LazyPage><Reminders /></LazyPage>} />
          <Route path="/expenses" element={<LazyPage><Expenses /></LazyPage>} />
          <Route path="/bills" element={<LazyPage><Bills /></LazyPage>} />
          <Route path="/summary" element={<LazyPage><Summary /></LazyPage>} />
          <Route path="/tax" element={<LazyPage><TaxCenter /></LazyPage>} />
          <Route path="/smart" element={<LazyPage><SmartTools /></LazyPage>} />
          <Route path="/business" element={<Navigate to="/today" replace />} />
          <Route path="/personal" element={<Navigate to="/today" replace />} />
          <Route path="/ai" element={<Navigate to="/smart" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LazyPage>
  )
}
