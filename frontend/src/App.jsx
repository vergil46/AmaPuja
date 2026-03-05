import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'
import HomePage from './pages/HomePage'

const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const LocalServiceLandingPage = lazy(() => import('./pages/LocalServiceLandingPage'))
const PoojaDetailPage = lazy(() => import('./pages/PoojaDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const RatingsPage = lazy(() => import('./pages/RatingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))
const HealthPage = lazy(() => import('./pages/HealthPage'))

function RouteFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-1/3 rounded bg-stone-200" />
        <div className="mt-3 h-4 w-2/3 rounded bg-stone-200" />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/admin-login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/locations/:city/:service" element={<LocalServiceLandingPage />} />
          <Route path="/services/:id" element={<PoojaDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/refund-policy" element={<PolicyPage type="refund" />} />
          <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
          <Route path="/terms-and-conditions" element={<PolicyPage type="terms" />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
