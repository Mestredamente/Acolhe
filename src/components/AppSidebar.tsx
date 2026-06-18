import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Settings,
  BrainCircuit,
  LifeBuoy,
  User,
  ChevronRight,
  Target,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import pb from '@/lib/pocketbase/client'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const profile = user?.profile || 'psicologo'
  const isSecretaria = profile === 'secretaria'
  const isAdmin = profile === 'admin'
  const isPaciente = profile === 'paciente'
  const isAutonomous = profile === 'psicologo' && !user?.id_clinica
  const isLinked = profile === 'psicologo' && !!user?.id_clinica

  const adminNav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Assinantes',
      icon: Users,
      subItems: [
        { name: 'Clínicas e Autônomos', href: '/admin/assinantes' },
        { name: 'Planos e Preços', href: '/admin/planos' },
        { name: 'Assinaturas Ativas', href: '/admin/assinaturas' },
      ],
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      subItems: [
        { name: 'Faturamento da Plataforma', href: '/admin/faturamento' },
        { name: 'Notas Fiscais', href: '/admin/notas-fiscais' },
        { name: 'Contabilidade', href: '/admin/contabilidade' },
        { name: 'Relatórios de Receita', href: '/admin/relatorios-receita' },
        { name: 'Inadimplência', href: '/admin/inadimplencia' },
      ],
    },
    {
      name: 'Marketing',
      icon: Target,
      subItems: [
        { name: 'Comunicações', href: '/admin/comunicacoes' },
        { name: 'Histórico de Envios', href: '/admin/comunicacoes-historico' },
      ],
    },
    { name: 'Usuários e Equipe', href: '/usuarios', icon: Users },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [
        { name: 'Dados da Empresa', href: '/admin/dados-empresa' },
        { name: 'Termos e Privacidade', href: '/admin/termos' },
        { name: 'Auditoria', href: '/admin/auditoria' },
      ],
    },
    { name: 'Demonstração', href: '/admin/demonstracao', icon: Target },
    { name: 'Suporte', href: '/suporte', icon: LifeBuoy },
  ]

  const psicologoAutonomoNav = [
    {
      name: 'Atendimento',
      icon: Users,
      subItems: [
        { name: 'Dashboard', href: '/' },
        { name: 'Pacientes', href: '/pacientes' },
        { name: 'Agenda', href: '/agenda' },
        { name: 'Mensagens', href: '/mensagens' },
        { name: 'Grupos Terapêuticos', href: '/grupos' },
        ...(user?.is_supervisor ? [{ name: 'Supervisão', href: '/supervisao' }] : []),
        { name: 'Telepsicologia', href: '/telepsicologia' },
      ],
    },
    { name: 'Documentos e IA', href: '/documentos', icon: FileText },
    {
      name: 'Financeiro',
      icon: DollarSign,
      subItems: [
        { name: 'Minhas Faturas', href: '/minhas-faturas' },
        { name: 'Minha Assinatura', href: '/minha-assinatura' },
        { name: 'Controle de Ponto', href: '/controle-ponto' },
      ],
    },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [
        { name: 'Meu Perfil', href: '/configuracoes' },
        { name: 'Dados Profissionais', href: '/dados-profissionais' },
        { name: 'Preferências', href: '/preferencias' },
        { name: 'Templates de Evolução', href: '/templates' },
        { name: 'Contas de Teste', href: '/configuracoes/contas-teste' },
      ],
    },
    { name: 'Suporte', href: '/suporte', icon: LifeBuoy },
  ]

  const psicologoVinculadoNav = [
    {
      name: 'Atendimento',
      icon: Users,
      subItems: [
        { name: 'Dashboard', href: '/' },
        { name: 'Pacientes', href: '/pacientes' },
        { name: 'Agenda', href: '/agenda' },
        { name: 'Mensagens', href: '/mensagens' },
        { name: 'Grupos Terapêuticos', href: '/grupos' },
        ...(user?.is_supervisor ? [{ name: 'Supervisão', href: '/supervisao' }] : []),
        { name: 'Telepsicologia', href: '/telepsicologia' },
      ],
    },
    { name: 'Documentos e IA', href: '/documentos', icon: FileText },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [
        { name: 'Meu Perfil', href: '/configuracoes' },
        { name: 'Preferências', href: '/preferencias' },
        { name: 'Templates de Evolução', href: '/templates' },
        { name: 'Contas de Teste', href: '/configuracoes/contas-teste' },
      ],
    },
    { name: 'Suporte', href: '/suporte', icon: LifeBuoy },
  ]

  const secretariaNav = [
    {
      name: 'Operação',
      icon: LayoutDashboard,
      subItems: [
        { name: 'Dashboard', href: '/secretaria/dashboard' },
        { name: 'Agenda', href: '/agenda' },
        { name: 'Pacientes', href: '/pacientes' },
      ],
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      subItems: [{ name: 'Faturas', href: '/financeiro' }],
    },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [{ name: 'Meu Perfil', href: '/configuracoes' }],
    },
    { name: 'Suporte', href: '/suporte', icon: LifeBuoy },
  ]

  const pacienteNav = [
    {
      name: 'Meu Acompanhamento',
      icon: User,
      subItems: [
        { name: 'Meus Dados', href: '/portal/dados' },
        { name: 'Meus Atendimentos', href: '/portal/atendimentos' },
        { name: 'Diário', href: '/portal/diario' },
        { name: 'Tarefas e Escalas', href: '/portal/tarefas' },
        { name: 'Mensagens', href: '/portal/mensagens' },
      ],
    },
    { name: 'Documentos', href: '/portal/documentos', icon: FileText },
    { name: 'Configurações', href: '/portal/configuracoes', icon: Settings },
    { name: 'Suporte', href: '/portal/suporte', icon: LifeBuoy },
  ]

  const navItems = isPaciente
    ? pacienteNav
    : isAdmin
      ? adminNav
      : isSecretaria
        ? secretariaNav
        : isAutonomous
          ? psicologoAutonomoNav
          : psicologoVinculadoNav

  return (
    <Sidebar
      style={{ '--sidebar-width': '280px', fontFamily: 'Inter, sans-serif' } as React.CSSProperties}
      className="border-r border-slate-200 bg-white shadow-sm"
    >
      <SidebarHeader className="p-6 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="bg-[#1E3A8A] p-2 rounded-lg flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">PsicoGestão</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-3">
              {navItems.map((item) => {
                if (item.subItems) {
                  const isAnySubActive = item.subItems.some(
                    (sub) =>
                      location.pathname === sub.href ||
                      (sub.href !== '/' &&
                        sub.href !== '/portal' &&
                        location.pathname.startsWith(sub.href + '/')),
                  )

                  return (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={isAnySubActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.name}
                            className={cn(
                              'transition-all duration-200 rounded-[6px] h-11',
                              isAnySubActive
                                ? 'text-[#1E3A8A] font-semibold'
                                : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50',
                            )}
                          >
                            <item.icon
                              className={cn(
                                'w-5 h-5',
                                isAnySubActive ? 'text-[#1E3A8A]' : 'text-slate-400',
                              )}
                            />
                            <span className="text-[15px]">{item.name}</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="flex flex-col gap-[16px] py-3 border-l border-slate-200 ml-[18px] pl-0">
                            {item.subItems.map((sub) => {
                              const isSubActive =
                                location.pathname === sub.href ||
                                (sub.href !== '/' &&
                                  sub.href !== '/portal' &&
                                  location.pathname.startsWith(sub.href))

                              return (
                                <SidebarMenuSubItem key={sub.name}>
                                  <Link
                                    to={sub.href}
                                    className={cn(
                                      'flex w-full items-center transition-all duration-200 text-[14px] px-4 py-2 -ml-[1px]',
                                      isSubActive
                                        ? 'bg-[#E0F2FE] text-[#1E3A8A] font-semibold border-l-[3px] border-[#1E3A8A]'
                                        : 'text-slate-500 hover:text-[#1E3A8A] border-l-[3px] border-transparent',
                                    )}
                                  >
                                    {sub.name}
                                  </Link>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' &&
                    item.href !== '/portal' &&
                    location.pathname.startsWith(item.href as string))

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'transition-all duration-200 rounded-[6px] h-11',
                        isActive
                          ? 'text-[#1E3A8A] font-semibold bg-blue-50'
                          : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50',
                      )}
                    >
                      <Link to={item.href as string} className="flex items-center gap-3 px-3">
                        <item.icon
                          className={cn('w-5 h-5', isActive ? 'text-[#1E3A8A]' : 'text-slate-400')}
                        />
                        <span className="text-[15px]">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t border-slate-200 flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm bg-white">
          <AvatarImage
            src={
              user?.avatar_url
                ? pb.files.getUrl(user, user.avatar_url)
                : user?.avatar
                  ? pb.files.getUrl(user, user.avatar)
                  : `https://img.usecurling.com/ppl/thumbnail?gender=neutral&seed=${user?.id || 1}`
            }
            alt={user?.name || 'User'}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
            <span className="truncate">{user?.name || 'Usuário'}</span>
            {user?.is_teste && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 leading-none shrink-0">
                TESTE
              </span>
            )}
          </span>
          <span className="text-xs text-slate-500 capitalize truncate">{profile}</span>
        </div>
      </div>
    </Sidebar>
  )
}
