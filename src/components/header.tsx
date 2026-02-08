import { getSession } from '@inspetor/lib/auth/server'
import { formatUsername } from '@inspetor/utils/format-username'
import { Cog, GitPullRequestIcon, PanelLeft, User } from 'lucide-react'
import Link from 'next/link'

import { HeaderContainer } from './header-container'
import { LogoutButton } from './logout-button'
// import { ModeToggleSub } from './theme/toggle'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { SidebarTrigger } from './ui/sidebar'
import { Muted, P, Small } from './ui/typography'

export async function Header() {
  const session = await getSession()

  return (
    <HeaderContainer>
      <div className="flex items-center gap-2">
        <SidebarTrigger>
          <PanelLeft className="size-4" />
        </SidebarTrigger>
        <Link className="text-xl text-foreground sm:hidden" href="/dashboard">
          Inspetor Industrial
        </Link>
      </div>

      <div className="flex items-center gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <Avatar className="size-10">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="flex items-center justify-center text-xs">
                {session?.user?.name
                  ? formatUsername(session?.user?.name)
                  : 'UU'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuGroup>
              <div className="flex items-center gap-4 w-72 p-2">
                <Avatar className="size-9">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="flex items-center justify-center text-xs">
                    {session?.user?.name
                      ? formatUsername(session?.user?.name)
                      : 'UU'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-start justify-start gap-0.5 flex-col">
                  <P className="text-sm truncate max-w-40">
                    {session?.user?.name}
                  </P>
                  <Muted className="text-xs truncate max-w-52">
                    {session?.user?.email && session?.user?.email}
                  </Muted>
                </div>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Link href="/changelogs">
              <DropdownMenuItem className="text-foreground">
                <GitPullRequestIcon className="size-4 text-foreground" />
                <Small>Registro de atualizações</Small>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-foreground">
              <Cog className="size-4 text-foreground" />
              <Small>Configurações</Small>
            </DropdownMenuItem>
            {/* <ModeToggleSub /> */}
            <Link href="/dashboard/profile">
              <DropdownMenuItem className="text-foreground">
                <User className="size-4 text-foreground" />
                <Small>Perfil</Small>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </HeaderContainer>
  )
}
