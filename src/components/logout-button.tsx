'use client'

import { useAuth } from '@inspetor/lib/auth/context'
import { LogOut } from 'lucide-react'

import { DropdownMenuItem } from './ui/dropdown-menu'
import { Small } from './ui/typography'

export function LogoutButton() {
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
  }

  return (
    <DropdownMenuItem
      className="text-destructive hover:!text-destructive"
      onClick={handleLogout}
    >
      <LogOut className="size-4 text-destructive" />
      <Small className="hover:!text-destructive">Sair</Small>
    </DropdownMenuItem>
  )
}
