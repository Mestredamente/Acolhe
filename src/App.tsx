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
import Faturamento from './pages/faturamento/Index'
import Configuracoes from './pages/configuracoes/Index'
import RelatoriosList from './pages/relatorios/Index'
import AutomacoesList from './pages/automacoes/Index'
import InsightsList from './pages/insights/Index'
import JornadaControl from './pages/jornada/Index'
import ModulosList from './pages/modulos/Index'
import ClinicasList from './pages/clinicas/Index'
import ClinicaDetails from './pages/clinicas/Details'
import SupervisaoList from './pages/supervisao/Index'
import SupervisaoDetails from './pages/supervisao/Details'
import GruposList from './pages/grupos/Index'
import GrupoDetails from './pages/grupos/Details'
import { AuthProvider } from './hooks/use-auth'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SecretaryDashboard } from './pages/secretaria/Dashboard'
import { PortalLogin } from './pages/portal/Login'
import { PortalDashboard } from './pages/portal/Dashboard'
import { PortalDiario } from './pages/portal/Diario'
import { PortalTarefas } from './pages/portal/Tarefas'
import { PortalDocumentos } from './pages/portal/Documentos'
import { PortalMensagens } from './pages/portal/Mensagens'
import { PortalConfiguracoes } from './pages/portal/Configuracoes'
import MensagensList from './pages/mensagens/Index'
import { PortalLayout } from './components/portal/PortalLayout'
import { PortalProtectedRoute } from './components/portal/PortalProtectedRoute'
import NotificacoesList from './pages/notificacoes/Index'
import { PortalOnboarding } from './pages/portal/Onboarding'
import { GlobalOnboarding } from './components/GlobalOnboarding'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/convite/:token" element={<PortalOnboarding />} />
          <Route element={<PortalProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route path="/portal" element={<PortalDashboard />} />
              <Route path="/portal/mensagens" element={<PortalMensagens />} />
              <Route path="/portal/diario" element={<PortalDiario />} />
              <Route path="/portal/tarefas" element={<PortalTarefas />} />
              <Route path="/portal/documentos" element={<PortalDocumentos />} />
              <Route path="/portal/notificacoes" element={<NotificacoesList isPortal />} />
              <Route path="/portal/configuracoes" element={<PortalConfiguracoes />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <>
                  <GlobalOnboarding />
                  <Layout />
                </>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/secretaria/dashboard" element={<SecretaryDashboard />} />
              <Route path="/mensagens" element={<MensagensList />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/:id" element={<PatientDetails />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/prontuarios" element={<Navigate to="/" replace />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/faturamento" element={<Faturamento />} />
              <Route path="/relatorios" element={<RelatoriosList />} />
              <Route path="/automacoes" element={<AutomacoesList />} />
              <Route path="/insights" element={<InsightsList />} />
              <Route path="/clinicas" element={<ClinicasList />} />
              <Route path="/clinicas/:id" element={<ClinicaDetails />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/notificacoes" element={<NotificacoesList />} />
              <Route path="/grupos" element={<GruposList />} />
              <Route path="/grupos/:id" element={<GrupoDetails />} />
              <Route path="/jornada" element={<JornadaControl />} />
              <Route path="/modulos" element={<ModulosList />} />
              <Route path="/supervisao" element={<SupervisaoList />} />
              <Route path="/supervisao/:id" element={<SupervisaoDetails />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
