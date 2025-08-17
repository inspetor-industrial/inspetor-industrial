'use client'

import NavbarLogo from '@inspetor/assets/navbar-logo.png'
import { cn } from '@inspetor/lib/utils'
import { ArrowRight, LogIn, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const session = useSession()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/institutional', label: 'Institucional' },
    { href: '/services', label: 'Serviços' },
    { href: '/contact', label: 'Contato' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-inspetor-dark-blue-700 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={NavbarLogo}
              alt="Inspetor Industrial"
              quality={100}
              width={120}
              height={40}
              className="h-8 w-auto max-sm:h-7"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105',
                    isActive(item.href) && 'text-white border-b-2 border-white',
                    !isActive(item.href) &&
                      'text-white/80 hover:text-white hover:bg-white/10 rounded-md',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Login Button & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Login Button */}
            <Link
              href="/auth/sign-in"
              className="group flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-inspetor-dark-blue-700"
            >
              {!session.data?.user && <LogIn className="size-4" />}
              <span className="max-sm:hidden">
                {session.data?.user ? 'SISTEMA' : 'Login'}
              </span>

              {session.data?.user && <ArrowRight className="size-4" />}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-inspetor-dark-blue-700"
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 bg-inspetor-dark-blue-800 px-2 pb-3 pt-2 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  '`block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href) && 'bg-white/20 text-white',
                  !isActive(item.href) &&
                    'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
