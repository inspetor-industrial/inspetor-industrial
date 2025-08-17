'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

import { DropdownMenuItem } from './ui/dropdown-menu'
import { Small } from './ui/typography'

export function LogoutButton() {
  async function handleLogout() {
    await signOut({ redirectTo: '/auth/sign-in' })
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
