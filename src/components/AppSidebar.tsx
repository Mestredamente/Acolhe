import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  BrainCircuit,
  MessageSquare,
  Shield,
  LifeBuoy,
  Building2,
  User,
  ChevronRight,
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
  SidebarMenuSubButton,
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

  const adminNav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Clínicas',
      icon: Building2,
      subItems: [{ name: 'Listar Clínicas', href: '/clinicas' }],
    },
    { name: 'Usuários e Equipe', href: '/usuarios', icon: Users },
    {
      name: 'Financeiro',
      icon: DollarSign,
      subItems: [
        { name: 'Faturamento', href: '/faturamento' },
        { name: 'Relatórios de Receita', href: '/financeiro' },
      ],
    },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [
        { name: 'Termos e Privacidade', href: '/admin/termos' },
        { name: 'Preferências da Plataforma', href: '/configuracoes' },
      ],
    },
    { name: 'Suporte', href: '/suporte', icon: LifeBuoy },
  ]

  const psicologoNav = [
    {
      name: 'Atendimento',
      icon: Users,
      subItems: [
        { name: 'Dashboard', href: '/' },
        { name: 'Pacientes', href: '/pacientes' },
        { name: 'Agenda', href: '/agenda' },
        { name: 'Mensagens', href: '/mensagens' },
      ],
    },
    { name: 'Documentos e IA', href: '/documentos', icon: FileText },
    {
      name: 'Financeiro',
      icon: DollarSign,
      subItems: [{ name: 'Minhas Faturas', href: '/financeiro' }],
    },
    {
      name: 'Configurações',
      icon: Settings,
      subItems: [{ name: 'Meu Perfil', href: '/configuracoes' }],
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
        : psicologoNav

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-sm font-sans">
      <SidebarHeader className="p-6 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center shadow-sm">
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
                            isActive={isAnySubActive}
                            className={cn(
                              'transition-all duration-200 rounded-[6px] h-10',
                              isAnySubActive
                                ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                                : 'text-slate-600 hover:text-primary hover:bg-slate-50',
                            )}
                          >
                            <item.icon
                              className={cn(
                                'w-5 h-5',
                                isAnySubActive ? 'text-primary' : 'text-slate-400',
                              )}
                            />
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((sub) => {
                              const isSubActive =
                                location.pathname === sub.href ||
                                (sub.href !== '/' &&
                                  sub.href !== '/portal' &&
                                  location.pathname.startsWith(sub.href))

                              return (
                                <SidebarMenuSubItem key={sub.name}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={cn(
                                      'transition-colors duration-200',
                                      isSubActive
                                        ? 'text-primary font-medium bg-primary/5'
                                        : 'text-slate-500 hover:text-primary',
                                    )}
                                  >
                                    <Link to={sub.href}>{sub.name}</Link>
                                  </SidebarMenuSubButton>
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
                      isActive={isActive}
                      className={cn(
                        'transition-all duration-200 rounded-[6px] h-10',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                          : 'text-slate-600 hover:text-primary hover:bg-slate-50',
                      )}
                    >
                      <Link to={item.href as string} className="flex items-center gap-3 py-2 px-3">
                        <item.icon
                          className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')}
                        />
                        <span>{item.name}</span>
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
          <span className="text-sm font-semibold text-slate-900 truncate">
            {user?.name || 'Usuário'}
          </span>
          <span className="text-xs text-slate-500 capitalize truncate">{profile}</span>
        </div>
      </div>
    </Sidebar>
  )
}
