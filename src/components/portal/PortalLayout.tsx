import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Home, BookHeart, CheckSquare, FileText, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationsPopover } from '@/components/NotificationsPopover'

export function PortalLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Início', path: '/portal', icon: Home },
    { name: 'Mensagens', path: '/portal/mensagens', icon: MessageSquare },
    { name: 'Diário', path: '/portal/diario', icon: BookHeart },
    { name: 'Tarefas', path: '/portal/tarefas', icon: CheckSquare },
    { name: 'Documentos', path: '/portal/documentos', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      <header className="bg-white border-b border-emerald-100 px-4 md:px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2 group">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <BookHeart className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-emerald-800 tracking-tight">PsicoPortal</h1>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-200/50',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <NotificationsPopover isPortal />
            <Button
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-emerald-100 px-4 py-2 overflow-x-auto sticky top-[73px] z-10 shadow-sm">
        <nav className="flex items-center gap-2 w-max">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:bg-slate-100',
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
        <Outlet />
      </main>
    </div>
  )
}
