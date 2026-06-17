import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import PatientDetails from './pages/pacientes/PatientDetails'
import PacientesList from './pages/pacientes/Index'
import Agenda from './pages/agenda/Index'
import Financeiro from './pages/financeiro/Index'
import Configuracoes from './pages/configuracoes/Index'
import { AuthProvider } from './hooks/use-auth'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PortalLogin } from './pages/portal/Login'
import { PortalDashboard } from './pages/portal/Dashboard'
import { PortalDiario } from './pages/portal/Diario'
import { PortalTarefas } from './pages/portal/Tarefas'
import { PortalDocumentos } from './pages/portal/Documentos'
import { PortalMensagens } from './pages/portal/Mensagens'
import MensagensList from './pages/mensagens/Index'
import { PortalLayout } from './components/portal/PortalLayout'
import { PortalProtectedRoute } from './components/portal/PortalProtectedRoute'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/portal/login" element={<PortalLogin />} />
          <Route element={<PortalProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route path="/portal" element={<PortalDashboard />} />
              <Route path="/portal/mensagens" element={<PortalMensagens />} />
              <Route path="/portal/diario" element={<PortalDiario />} />
              <Route path="/portal/tarefas" element={<PortalTarefas />} />
              <Route path="/portal/documentos" element={<PortalDocumentos />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/mensagens" element={<MensagensList />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/:id" element={<PatientDetails />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/prontuarios" element={<Navigate to="/" replace />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
