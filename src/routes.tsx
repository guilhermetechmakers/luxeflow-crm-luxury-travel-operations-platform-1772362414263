import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/auth'
import { Landing } from '@/pages/landing'
import { Login } from '@/pages/login'
import { Signup } from '@/pages/signup'
import { VerifyEmail } from '@/pages/verify-email'
import { ForgotPassword } from '@/pages/forgot-password'
import { ResetPassword } from '@/pages/reset-password'
import { Dashboard } from '@/pages/dashboard'
import { ClientsList } from '@/pages/clients-list'
import { ClientDetail } from '@/pages/client-detail'
import { BookingsList } from '@/pages/bookings-list'
import { BookingDetail } from '@/pages/booking-detail'
import { BookingWizard } from '@/pages/booking-wizard'
import { Calendar } from '@/pages/calendar'
import { Tasks } from '@/pages/tasks'
import { ResortsList } from '@/pages/resorts-list'
import { ResortDetail } from '@/pages/resort-detail'
import { Reports } from '@/pages/reports'
import { Chat } from '@/pages/chat'
import { AIAssistant } from '@/pages/ai-assistant'
import { Admin } from '@/pages/admin'
import { Settings } from '@/pages/settings'
import { Transactions } from '@/pages/transactions'
import { Documents } from '@/pages/documents'
import { NotFound } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error'
import { StaticPage } from '@/pages/static'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'clients', element: <ClientsList /> },
      { path: 'clients/:id', element: <ClientDetail /> },
      { path: 'bookings', element: <BookingsList /> },
      { path: 'bookings/new', element: <BookingWizard /> },
      { path: 'bookings/:id/edit', element: <BookingWizard /> },
      { path: 'bookings/:id', element: <BookingDetail /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'resorts', element: <ResortsList /> },
      { path: 'resorts/:id', element: <ResortDetail /> },
      { path: 'reports', element: <Reports /> },
      { path: 'chat', element: <Chat /> },
      { path: 'ai', element: <AIAssistant /> },
      { path: 'admin', element: <Admin /> },
      { path: 'admin/users', element: <Admin /> },
      { path: 'settings', element: <Settings /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'documents', element: <Documents /> },
    ],
  },
  { path: '/privacy', element: <StaticPage title="Privacy Policy" content="Privacy policy content." /> },
  { path: '/terms', element: <StaticPage title="Terms of Service" content="Terms of service content." /> },
  { path: '/help', element: <StaticPage title="Help" content="Help and support content." /> },
  { path: '/404', element: <NotFound /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <NotFound /> },
])
