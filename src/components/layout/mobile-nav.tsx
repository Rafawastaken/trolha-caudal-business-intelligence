import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { TrolhaWordmark } from '@/components/brand/trolha-wordmark'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import { MAIN_NAV, SECONDARY_NAV, type NavItem } from './nav-items'

/** Navegação em drawer para mobile — substitui a sidebar (escondida em <lg). */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 gap-0 p-0">
        <SheetTitle className="sr-only">Navegação</SheetTitle>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <TrolhaWordmark className="text-lg text-foreground" />
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-primary">
            PULSE
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {MAIN_NAV.map((item) => (
            <MobileNavLink key={item.to} item={item} onNavigate={close} />
          ))}
        </nav>
        <div className="space-y-1 border-t p-2">
          {SECONDARY_NAV.map((item) => (
            <MobileNavLink key={item.to} item={item} onNavigate={close} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavLink({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        )
      }
    >
      <item.icon className="size-[18px] shrink-0" />
      {item.label}
    </NavLink>
  )
}
