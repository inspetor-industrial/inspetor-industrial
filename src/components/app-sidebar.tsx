'use client'

import { useRouter } from '@bprogress/next'
import { useAbility } from '@inspetor/casl/context'
import { useSession } from '@inspetor/lib/auth/context'
import { formatUsername } from '@inspetor/utils/format-username'
import {
  ChevronRight,
  ChevronsUpDown,
  Cog,
  Command,
  Database,
  GitPullRequestIcon,
  HardDrive,
  Home,
  InspectionPanel,
  Notebook,
  Settings,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

import { LogoutButton } from './logout-button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from './ui/sidebar'
import { Muted, P } from './ui/typography'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  flags: {
    disableEquipments: boolean
    disableBoilerReport: boolean
  }
}

export function AppSidebar({ user, flags, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const session = useSession()
  const router = useRouter()
  const ability = useAbility()

  const isAdmin = session.data?.user?.role === 'ADMIN'
  const mustBeHideStorageManagement = !ability.can('read', 'Storage')
  const mustBeHideCompanyManagement = !isAdmin
  const mustBeHideUsersManagement = !isAdmin
  const mustBeHideDailyMaintenance = !ability.can('read', 'MaintenanceDaily')
  const mustBeHideEquipmentManagement = !ability.can(
    'read',
    'MaintenanceEquipment',
  )
  const mustBeHideClientManagement = !ability.can('read', 'Client')
  const mustBeHideInstrumentsManagement = !ability.can('read', 'Instruments')
  const mustBeHideBoilerManagement =
    flags.disableBoilerReport || !ability.can('read', 'ReportBoiler')
  const mustBeHideDocumentsManagement = !ability.can('read', 'Documents')
  const mustBeHideValveManagement = !ability.can('read', 'ReportValve')
  const mustBeHideBombManagement = !ability.can('read', 'ReportBomb')

  const mustBeHideInspectionManagement =
    mustBeHideInstrumentsManagement && mustBeHideBoilerManagement

  const mustBeHideEquipmentsSection =
    flags.disableEquipments ||
    (mustBeHideValveManagement && mustBeHideBombManagement)

  const mustBeHideDatabaseManagement =
    mustBeHideCompanyManagement &&
    mustBeHideUsersManagement &&
    mustBeHideClientManagement

  const mustBeHideMaintenanceManagement =
    mustBeHideDailyMaintenance && mustBeHideEquipmentManagement

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-inspetor-secondary">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Inspetor</span>
                  <span className="truncate text-xs">
                    Portal Administrativo
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {session.status === 'loading' ? (
          <>
            {Array.from({ length: 10 }).map((_, index) => (
              <SidebarMenuSkeleton key={index} />
            ))}
          </>
        ) : (
          <Fragment>
            <SidebarGroup className="pb-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem key="dashboard">
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === '/dashboard' &&
                        pathname.startsWith('/dashboard')
                      }
                    >
                      <Link href="/dashboard">
                        <Home />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="py-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible asChild className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Armazenamento">
                          <HardDrive />
                          <span>Armazenamento</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              isActive={
                                pathname === '/dashboard/storage/reports' &&
                                pathname.startsWith(
                                  '/dashboard/storage/reports',
                                )
                              }
                              asChild
                            >
                              <Link href="/dashboard/storage/reports">
                                <span>Relatórios</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {!mustBeHideStorageManagement && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={
                                  pathname === '/dashboard/storage' &&
                                  pathname.startsWith('/dashboard/storage')
                                }
                                asChild
                              >
                                <Link href="/dashboard/storage">
                                  <span>Storage Management</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {!mustBeHideDocumentsManagement && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={
                                  pathname === '/dashboard/documents' &&
                                  pathname.startsWith('/dashboard/documents')
                                }
                                asChild
                              >
                                <Link href="/dashboard/documents">
                                  <span>Documentos</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!mustBeHideDatabaseManagement && (
              <SidebarGroup className="py-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible asChild className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="Armazenamento">
                            <Database />
                            <span>Base de Dados</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {!mustBeHideCompanyManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/company' &&
                                    pathname.startsWith('/dashboard/company')
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/company">
                                    <span>Empresas</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}

                            {!mustBeHideClientManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/client' &&
                                    pathname.startsWith('/dashboard/client')
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/client">
                                    <span>Clientes</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}

                            {!mustBeHideUsersManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/users' &&
                                    pathname.startsWith('/dashboard/users')
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/users">
                                    <span>Usuários</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {!mustBeHideInspectionManagement && (
              <SidebarGroup className="py-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible asChild className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="Inspeções">
                            <InspectionPanel />
                            <span>Inspeções</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {!mustBeHideInstrumentsManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/instruments' &&
                                    pathname.startsWith(
                                      '/dashboard/instruments',
                                    )
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/instruments">
                                    <span>Instrumentos</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}

                            {!mustBeHideBoilerManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/reports/boiler' &&
                                    pathname.startsWith(
                                      '/dashboard/reports/boiler',
                                    )
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/reports/boiler">
                                    <span>Inspeções de Caldeiras</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {!mustBeHideEquipmentsSection && (
              <SidebarGroup className="py-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible asChild className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="Equipamentos">
                            <Cog />
                            <span>Equipamentos</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {!mustBeHideValveManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/valve' &&
                                    pathname.startsWith('/dashboard/valve')
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/valve">
                                    <span>Válvulas</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}

                            {!mustBeHideBombManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname === '/dashboard/bomb' &&
                                    pathname.startsWith('/dashboard/bomb')
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/bomb">
                                    <span>Bombas</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {!mustBeHideMaintenanceManagement && (
              <SidebarGroup className="py-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible asChild className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="Manutenções">
                            <Notebook />
                            <span>Manutenções</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {/* {!mustBeHideDailyMaintenance && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  isActive={
                                    pathname ===
                                      '/dashboard/maintenance/daily' &&
                                    pathname.startsWith(
                                      '/dashboard/maintenance/daily',
                                    )
                                  }
                                  asChild
                                >
                                  <Link href="/dashboard/maintenance/daily">
                                    <span>Diárias</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )} */}

                            {!mustBeHideEquipmentManagement && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/dashboard/maintenance/equipment">
                                    <span>Equipamentos</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </Fragment>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-inspetor-secondary data-[state=open]:text-white"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.image || ''}
                      alt={user?.name || 'Usuário'}
                    />
                    <AvatarFallback className="rounded-lg text-black">
                      {user?.name ? formatUsername(user.name) : 'UU'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <P className="truncate font-semibold text-sm">
                      {user?.name || 'Usuário'}
                    </P>
                    <Muted className="truncate text-xs">
                      {user?.email && user.email}
                    </Muted>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.image || ''}
                        alt={user?.name || 'Usuário'}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.name ? formatUsername(user.name) : 'UU'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <P className="truncate font-semibold text-sm">
                        {user?.name || 'Usuário'}
                      </P>
                      <Muted className="truncate text-xs">
                        {user?.email && user.email}
                      </Muted>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/dashboard/profile')
                  }}
                >
                  <User />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/changelogs')
                  }}
                >
                  <GitPullRequestIcon className="size-4" />
                  Changelogs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
