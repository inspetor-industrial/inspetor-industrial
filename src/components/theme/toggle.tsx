'use client'

import { Button } from '@inspetor/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@inspetor/components/ui/dropdown-menu'
import { cn } from '@inspetor/lib/utils'
import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

type ModeToggleProps = {
  trigger?: React.ComponentProps<'button'>
}

export function ModeToggle({ trigger }: ModeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={trigger?.className}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-1/2 -translate-1/2 left-1/2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="justify-between"
          onClick={() => setTheme('light')}
        >
          Light
          <Check
            className={cn(
              'text-foreground sr-only',
              resolvedTheme === 'light' && 'not-sr-only',
            )}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between"
          onClick={() => setTheme('dark')}
        >
          Dark
          <Check
            className={cn(
              'text-foreground sr-only',
              resolvedTheme === 'dark' && 'not-sr-only',
            )}
          />
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ModeToggleSub() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer gap-2 font-medium">
        {resolvedTheme === 'light' ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
        Tema
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent sideOffset={10}>
          <DropdownMenuItem
            className="justify-between"
            onClick={() => setTheme('light')}
          >
            Light
            <Check
              className={cn(
                'text-foreground sr-only',
                resolvedTheme === 'light' && 'not-sr-only',
              )}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onClick={() => setTheme('dark')}
          >
            Dark
            <Check
              className={cn(
                'text-foreground sr-only',
                resolvedTheme === 'dark' && 'not-sr-only',
              )}
            />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
