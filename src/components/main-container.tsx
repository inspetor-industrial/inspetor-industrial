'use client'

import { useSidebar } from '@inspetor/components/ui/sidebar'
import { cn } from '@inspetor/lib/utils'

import { ScrollArea } from './ui/scroll-area'

type MainContainerProps = {
  children: React.ReactNode
  className?: string
}

export function MainContainer({ children, className }: MainContainerProps) {
  const { state } = useSidebar()

  return (
    <ScrollArea
      className={cn(
        'h-full w-full p-4',
        state === 'collapsed' && 'max-h-[calc(100vh-49px)]',
        state === 'expanded' && 'max-h-[calc(100vh-65px)]',
        className,
      )}
    >
      {children}
    </ScrollArea>
  )
}
