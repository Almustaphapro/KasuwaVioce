import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { PageLoading } from '@/components/common/page-loading'
import { NotFoundPage } from '@/pages/not-found'
import { RouteErrorPage } from '@/pages/route-error'
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
    children: [
      {
        path: '/',
        lazy: async () => ({ Component: (await import('@/pages/dashboard')).DashboardPage }),
      },
      { path: '/dashboard', element: <Navigate to="/" replace /> },
      {
        path: '/voice',
        lazy: async () => ({ Component: (await import('@/pages/voice')).VoicePage }),
      },
      {
        path: '/transactions',
        lazy: async () => ({ Component: (await import('@/pages/transactions')).TransactionsPage }),
      },
      {
        path: '/inventory',
        lazy: async () => ({ Component: (await import('@/pages/inventory')).InventoryPage }),
      },
      {
        path: '/reports',
        lazy: async () => ({ Component: (await import('@/pages/reports')).ReportsPage }),
      },
      {
        path: '/settings',
        lazy: async () => ({ Component: (await import('@/pages/settings')).SettingsPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/pages/auth')).LoginPage }),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
  },
  {
    path: '/register',
    lazy: async () => ({ Component: (await import('@/pages/auth')).RegistrationPage }),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
  },
  {
    path: '/forgot-password',
    lazy: async () => ({ Component: (await import('@/pages/auth')).ForgotPasswordPage }),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
  },
  {
    path: '/onboarding',
    lazy: async () => ({ Component: (await import('@/pages/onboarding')).OnboardingPage }),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
  },
])
