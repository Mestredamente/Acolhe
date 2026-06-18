import { Search, BrainCircuit } from 'lucide-react'
import { NotificationsPopover } from '@/components/NotificationsPopover'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { useBranding } from '@/hooks/use-branding'

export function Header() {
  const { appName, logoUrl } = useBranding()
  const { user, signOut } = useAuth()

  const isPaciente = user?.profile === 'paciente'
  const isSecretaria = user?.profile === 'secretaria'

  const getRoleName = () => {
    if (isPaciente) return 'Paciente'
    if (isSecretaria) return 'Secretária'
    if (user?.profile === 'admin') return 'Administrador'
    return 'Psicólogo Clínico'
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm z-10 sticky top-0 w-full transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="md:hidden text-slate-500 hover:text-primary transition-colors" />
        <div className="hidden md:flex items-center gap-2 text-primary font-bold text-xl mr-8">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
          ) : (
            <BrainCircuit className="w-6 h-6" />
          )}
          <span>{appName}</span>
        </div>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes, agendamentos, etc..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-[6px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPopover />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-slate-900">
                  {user?.name || 'Usuário'}
                </span>
                <span className="text-xs text-slate-500">{getRoleName()}</span>
              </div>
              <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
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
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
