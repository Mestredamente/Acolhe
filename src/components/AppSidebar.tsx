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
  BarChart3,
  Receipt,
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

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Mensagens', href: '/mensagens', icon: MessageSquare },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Prontuários', href: '/prontuarios', icon: FileText },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const isSecretaria = user?.profile === 'secretaria'

  const filteredNav = [
    {
      name: 'Dashboard',
      href: isSecretaria ? '/secretaria/dashboard' : '/',
      icon: LayoutDashboard,
    },
    { name: 'Mensagens', href: '/mensagens', icon: MessageSquare, hidden: isSecretaria },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Prontuários', href: '/prontuarios', icon: FileText, hidden: isSecretaria },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign, hidden: isSecretaria },
    { name: 'Faturamento', href: '/faturamento', icon: Receipt, hidden: isSecretaria },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, hidden: isSecretaria },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ].filter((item) => !item.hidden)

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-primary">PsicoGestão</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {filteredNav.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                          : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                      }
                    >
                      <Link to={item.href} className="flex items-center gap-3 py-2 px-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
