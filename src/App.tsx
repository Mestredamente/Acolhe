import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AdminDashboard from './pages/admin/Dashboard'
import PatientDetails from './pages/pacientes/PatientDetails'
import PacientesList from './pages/pacientes/Index'
import Agenda from './pages/agenda/Index'
import Financeiro from './pages/financeiro/Index'
import Faturamento from './pages/faturamento/Index'
import Configuracoes from './pages/configuracoes/Index'
import ClinicasList from './pages/clinicas/Index'
import ClinicaDetails from './pages/clinicas/Details'
import UsuariosList from './pages/usuarios/Index'
import AssinantesList from './pages/admin/AssinantesList'
import PlanosList from './pages/admin/PlanosList'
import AssinaturasAtivas from './pages/admin/AssinaturasAtivas'
import NotasFiscais from './pages/admin/NotasFiscais'
import Contabilidade from './pages/admin/Contabilidade'
import Comunicacoes from './pages/admin/Comunicacoes'
import ComunicacoesHistorico from './pages/admin/ComunicacoesHistorico'
import { Demonstracao } from './pages/admin/Demonstracao'
import { ContasTeste } from './pages/configuracoes/ContasTeste'
import { AuthProvider } from './hooks/use-auth'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SecretaryDashboard } from './pages/secretaria/Dashboard'
import { PortalLogin } from './pages/portal/Login'
import { PortalDashboard } from './pages/portal/Dashboard'
import PortalAtendimentos from './pages/portal/Atendimentos'
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
import SuportePage from './pages/suporte/Index'
import TermosPrivacidade from './pages/admin/Termos'
import { TermosAcceptanceModal } from './components/TermosAcceptanceModal'
import TemplatesList from './pages/templates/Index'
import MinhaAssinatura from './pages/financeiro/MinhaAssinatura'
import MinhasFaturas from './pages/financeiro/MinhasFaturas'
import DadosProfissionais from './pages/configuracoes/DadosProfissionais'
import Sessao from './pages/Sessao'

const App = () => (
  <AuthProvider>
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', sans-serif !important; }
    `,
      }}
    />
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/convite/:token" element={<PortalOnboarding />} />
          <Route path="/sessao/:id" element={<Sessao />} />
          <Route element={<PortalProtectedRoute />}>
            <Route
              element={
                <>
                  <TermosAcceptanceModal />
                  <PortalLayout />
                </>
              }
            >
              <Route path="/portal" element={<PortalDashboard />} />
              <Route path="/portal/dados" element={<PortalDashboard />} />
              <Route path="/portal/atendimentos" element={<PortalAtendimentos />} />
              <Route path="/portal/mensagens" element={<PortalMensagens />} />
              <Route path="/portal/diario" element={<PortalDiario />} />
              <Route path="/portal/tarefas" element={<PortalTarefas />} />
              <Route path="/portal/documentos" element={<PortalDocumentos />} />
              <Route path="/portal/notificacoes" element={<NotificacoesList isPortal />} />
              <Route path="/portal/configuracoes" element={<PortalConfiguracoes />} />
              <Route path="/portal/suporte" element={<SuportePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <>
                  <TermosAcceptanceModal />
                  <GlobalOnboarding />
                  <Layout />
                </>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/gestor" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/psicologo" element={<Navigate to="/" replace />} />
              <Route path="/clinica" element={<Navigate to="/" replace />} />
              <Route path="/secretaria" element={<Navigate to="/secretaria/dashboard" replace />} />
              <Route path="/paciente" element={<Navigate to="/portal" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/termos" element={<TermosPrivacidade />} />
              <Route path="/secretaria/dashboard" element={<SecretaryDashboard />} />
              <Route path="/mensagens" element={<MensagensList />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/:id" element={<PatientDetails />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/prontuarios" element={<Navigate to="/pacientes" replace />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/faturamento" element={<Faturamento />} />
              <Route path="/clinicas" element={<Navigate to="/admin/assinantes" replace />} />
              <Route path="/clinicas/:id" element={<ClinicaDetails />} />
              <Route path="/usuarios" element={<UsuariosList />} />
              <Route path="/admin/assinantes" element={<AssinantesList />} />
              <Route path="/admin/planos" element={<PlanosList />} />
              <Route path="/admin/assinaturas" element={<AssinaturasAtivas />} />
              <Route path="/admin/faturamento" element={<AssinaturasAtivas />} />
              <Route path="/admin/notas-fiscais" element={<NotasFiscais />} />
              <Route path="/admin/contabilidade" element={<Contabilidade />} />
              <Route
                path="/admin/relatorios-receita"
                element={<Navigate to="/admin/contabilidade" replace />}
              />
              <Route path="/admin/inadimplencia" element={<AssinaturasAtivas />} />
              <Route path="/admin/comunicacoes" element={<Comunicacoes />} />
              <Route path="/admin/comunicacoes-historico" element={<ComunicacoesHistorico />} />
              <Route
                path="/admin/dados-empresa"
                element={<Navigate to="/configuracoes?tab=perfil-empresa" replace />}
              />
              <Route path="/admin/demonstracao" element={<Demonstracao />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/configuracoes/contas-teste" element={<ContasTeste />} />
              <Route path="/templates" element={<TemplatesList />} />
              <Route path="/notificacoes" element={<NotificacoesList />} />
              <Route path="/suporte" element={<SuportePage />} />
              <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
              <Route path="/minhas-faturas" element={<MinhasFaturas />} />
              <Route path="/dados-profissionais" element={<DadosProfissionais />} />
              <Route path="/preferencias" element={<Configuracoes />} />
              <Route path="/documentos" element={<Navigate to="/pacientes" replace />} />
              <Route path="/grupos" element={<Navigate to="/" replace />} />
              <Route path="/supervisao" element={<Navigate to="/" replace />} />
              <Route path="/telepsicologia" element={<Navigate to="/" replace />} />
              <Route path="/controle-ponto" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
