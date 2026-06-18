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
} from '@/components/ui/sidebar'
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

  const baseNav = [
    {
      name: 'Dashboard',
      href: isAdmin ? '/admin/dashboard' : isSecretaria ? '/secretaria/dashboard' : '/',
      icon: LayoutDashboard,
      roles: ['psicologo', 'admin', 'secretaria'],
    },
    {
      name: 'Pacientes',
      href: '/pacientes',
      icon: Users,
      roles: ['psicologo', 'admin', 'secretaria'],
    },
    {
      name: 'Agenda',
      href: '/agenda',
      icon: Calendar,
      roles: ['psicologo', 'admin', 'secretaria'],
    },
    {
      name: 'Prontuários',
      href: '/prontuarios',
      icon: FileText,
      roles: ['psicologo', 'admin'],
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign,
      roles: ['psicologo', 'admin'],
    },
    {
      name: 'Gestão de Usuários',
      href: '/usuarios',
      icon: Shield,
      roles: ['admin'],
    },
    {
      name: 'Clínicas',
      href: '/clinicas',
      icon: Building2,
      roles: ['admin'],
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      roles: ['psicologo', 'admin', 'secretaria'],
    },
    {
      name: 'Suporte',
      href: '/suporte',
      icon: LifeBuoy,
      roles: ['psicologo', 'admin'],
    },
  ]

  const patientNav = [
    { name: 'Meus Dados', href: '/portal/dados', icon: User },
    { name: 'Meus Atendimentos', href: '/portal/atendimentos', icon: Calendar },
    { name: 'Diário Pessoal', href: '/portal/diario', icon: FileText },
    { name: 'Tarefas e Escalas', href: '/portal/tarefas', icon: FileText },
    { name: 'Mensagens', href: '/portal/mensagens', icon: MessageSquare },
    { name: 'Documentos', href: '/portal/documentos', icon: FileText },
    { name: 'Configurações', href: '/portal/configuracoes', icon: Settings },
    { name: 'Suporte', href: '/portal/suporte', icon: LifeBuoy },
  ]

  const filteredNav = isPaciente
    ? patientNav
    : baseNav.filter((item) => item.roles.includes(profile))

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-sm">
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
              {filteredNav.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' &&
                    item.href !== '/portal' &&
                    location.pathname.startsWith(item.href))
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
                      <Link to={item.href} className="flex items-center gap-3 py-2 px-3">
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
