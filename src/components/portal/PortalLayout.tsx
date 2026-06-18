import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'
import { DisclaimerNotice } from '@/components/DisclaimerNotice'

export function PortalLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background animate-fade-in text-gray-900 font-sans">
        <AppSidebar />
        <SidebarInset className="flex w-full flex-col overflow-hidden bg-transparent">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <DisclaimerNotice />
            <div className="mx-auto max-w-5xl w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
