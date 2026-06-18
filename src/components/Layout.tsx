import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { DisclaimerNotice } from './DisclaimerNotice'
import { useAuth } from '@/hooks/use-auth'
import { ImpersonationBar } from './ImpersonationBar'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function Layout() {
  const { isDemonstrationMode, impersonatedUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleBlocked = () => {
      toast({
        title: 'Acesso Bloqueado',
        description: 'Acesso a dados de paciente bloqueado no modo de demonstração. Conforme LGPD.',
        variant: 'destructive',
      })
      navigate('/admin/dashboard')
    }

    const handleMutationBlocked = () => {
      toast({
        title: 'Ação Bloqueada',
        description: 'Não é possível alterar dados no modo de demonstração.',
        variant: 'destructive',
      })
    }

    window.addEventListener('demo-mode-blocked', handleBlocked)
    window.addEventListener('demo-mode-mutation-blocked', handleMutationBlocked)

    return () => {
      window.removeEventListener('demo-mode-blocked', handleBlocked)
      window.removeEventListener('demo-mode-mutation-blocked', handleMutationBlocked)
    }
  }, [navigate, toast])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background animate-fade-in text-gray-900 font-sans flex-col">
        {impersonatedUser && <ImpersonationBar />}
        <div className="flex flex-1 w-full overflow-hidden relative">
          <AppSidebar />
          <SidebarInset className="flex w-full flex-col overflow-hidden bg-transparent">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <DisclaimerNotice />
              <div className="mx-auto max-w-6xl w-full">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
