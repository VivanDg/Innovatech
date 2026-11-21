import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, RutaPorRol, RutaProtegida, useAuth } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { EquiposPage } from './pages/EquiposPage'
import { PrestamosPage } from './pages/PrestamosPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { ReportesPage } from './pages/ReportesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 20_000,
    },
  },
})

// Si el usuario ya está autenticado y entra a "/", lo enviamos al Dashboard dentro del Layout.
// Si no está autenticado, ve la Landing Page con toda la presentación del sistema.
function RaizApp() {
  const { autenticado } = useAuth()

  if (!autenticado) {
    return <LandingPage />
  }

  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RaizApp />} />

            {/* Rutas del Sistema Protegidas */}
            <Route
              element={
                <RutaProtegida>
                  <AppLayout />
                </RutaProtegida>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="equipos" element={<EquiposPage />} />
              <Route path="prestamos" element={<PrestamosPage />} />
              <Route
                path="usuarios"
                element={
                  <RutaPorRol roles={['Administrador']}>
                    <UsuariosPage />
                  </RutaPorRol>
                }
              />
              <Route
                path="reportes"
                element={
                  <RutaPorRol roles={['Administrador', 'ResponsableTecnologia']}>
                    <ReportesPage />
                  </RutaPorRol>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: '"Nunito Sans", sans-serif',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                color: 'var(--ink)',
                background: 'var(--paper)',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
