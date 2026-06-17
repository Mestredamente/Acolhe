import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import PatientDetails from './pages/pacientes/PatientDetails'
import PacientesList from './pages/pacientes/Index'
import { AuthProvider } from './hooks/use-auth'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/:id" element={<PatientDetails />} />
              <Route path="/agenda" element={<Navigate to="/" replace />} />
              <Route path="/prontuarios" element={<Navigate to="/" replace />} />
              <Route path="/financeiro" element={<Navigate to="/" replace />} />
              <Route path="/configuracoes" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
