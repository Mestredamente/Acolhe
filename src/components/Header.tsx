import { NotificationsPopover } from '@/components/NotificationsPopover'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPopover />
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium">Dra. Clara Mendes</span>
            <span className="text-xs text-muted-foreground">Psicóloga Clínica</span>
          </div>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage
              src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99"
              alt="Dra. Clara"
            />
            <AvatarFallback>CM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
