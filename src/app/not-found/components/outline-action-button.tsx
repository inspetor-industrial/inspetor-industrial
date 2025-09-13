import { Button } from '@inspetor/components/ui/button'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface OutlineActionButtonProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function OutlineActionButton({
  href,
  icon: Icon,
  children,
  className = '',
}: OutlineActionButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="lg"
        className={`border-2 border-inspetor-dark-blue-700 text-inspetor-dark-blue-700 bg-transparent hover:bg-inspetor-dark-blue-700/10 hover:text-inspetor-dark-blue-800 hover:border-inspetor-dark-blue-800 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-inspetor-dark-blue-700/30 focus:ring-offset-2 h-14 ${className}`}
      >
        <Icon className="size-5" />
        <span className="font-semibold">{children}</span>
      </Button>
    </Link>
  )
}
