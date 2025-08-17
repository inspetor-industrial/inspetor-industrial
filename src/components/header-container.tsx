'use client'

import { useSidebar } from '@inspetor/components/ui/sidebar'
import { cn } from '@inspetor/lib/utils'

export function HeaderContainer({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar()

  return (
    <header
      className={cn(
        'flex justify-between items-center px-4 py-2 border-b border-input shadow-input',
        state === 'expanded' && 'h-[65px]',
        state === 'collapsed' && 'h-[49px]',
      )}
    >
      {children}
    </header>
  )
}
