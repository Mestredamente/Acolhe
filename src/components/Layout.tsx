import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { DisclaimerNotice } from './DisclaimerNotice'
import { DemoBanner } from './DemoBanner'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background animate-fade-in text-gray-900 font-sans flex-col">
        <DemoBanner />
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
