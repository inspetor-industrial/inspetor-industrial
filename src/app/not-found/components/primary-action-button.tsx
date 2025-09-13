import { Button } from '@inspetor/components/ui/button'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface PrimaryActionButtonProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function PrimaryActionButton({
  href,
  icon: Icon,
  children,
  className = '',
}: PrimaryActionButtonProps) {
  return (
    <Link href={href}>
      <Button
        size="lg"
        className={`bg-inspetor-dark-blue-700 hover:bg-inspetor-dark-blue-800 text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-inspetor-dark-blue-700 h-14 ${className}`}
      >
        <Icon className="size-5" />
        <span className="font-semibold">{children}</span>
      </Button>
    </Link>
  )
}
