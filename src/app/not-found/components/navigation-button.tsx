import { Button } from '@inspetor/components/ui/button'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface NavigationButtonProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function NavigationButton({
  href,
  icon: Icon,
  children,
  variant = 'default',
  size = 'default',
  className = '',
}: NavigationButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant={variant}
        size={size}
        className={className}
      >
        <Icon className="size-4" />
        {children}
      </Button>
    </Link>
  )
}
