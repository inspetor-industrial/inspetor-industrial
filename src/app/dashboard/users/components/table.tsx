'use client'

import { subject } from '@casl/ability'
import { toggleUserStatusAction } from '@inspetor/actions/toggle-user-status'
import { type Subjects } from '@inspetor/casl/ability'
import { Can, useAbility } from '@inspetor/casl/context'
import { Badge } from '@inspetor/components/ui/badge'
import { Button } from '@inspetor/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@inspetor/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@inspetor/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@inspetor/components/ui/table'
import type { UserStatus } from '@inspetor/generated/prisma/client'
import {
  getUsersQueryKey,
  type UserListItem,
  useUsersQuery,
} from '@inspetor/hooks/use-users-query'
import { cn } from '@inspetor/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  ToggleLeft,
  ToggleRight,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { UserEditModal } from './edit-modal'
import { UserTableSkeleton } from './table-skeleton'

export function UserTable() {
  const toggleStatusAction = useServerAction(toggleUserStatusAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [status] = useQueryState('status', parseAsString.withDefault(''))

  const { data, isPending, isError } = useUsersQuery(search, page, status)
  const editModalRef = useRef<{
    open: (user: UserListItem, isOnlyRead?: boolean) => void
  } | null>(null)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleToggleUserStatus(
    userId: string,
    statusValue: UserStatus,
  ) {
    toast.loading('Atualizando status do usuário...', {
      id: 'toggle-user-status',
    })
    const [result, resultError] = await toggleStatusAction.execute({
      userId,
      status: statusValue === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    })

    if (resultError) {
      toast.error('Erro ao atualizar status do usuário', {
        id: 'toggle-user-status',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'toggle-user-status',
      })
      await queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })
    } else {
      toast.error(result?.message, {
        id: 'toggle-user-status',
      })
    }
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar usuários.
      </div>
    )
  }

  if (isPending || !data) {
    return <UserTableSkeleton />
  }

  const { users, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum usuário encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => {
              const subjectUser = subject('User', {
                companyId: user.companyId ?? undefined,
              }) as unknown as Subjects
              const showActions =
                ability.can('update', subjectUser) ||
                ability.can('read', subjectUser)

              return (
                <TableRow key={user.id} className="divide-x">
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.company?.name ?? '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'capitalize',
                        user.status === 'ACTIVE' && 'bg-green-500',
                        user.status === 'INACTIVE' && 'bg-red-500',
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {showActions ? (
                      <div className="flex justify-center items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              icon={Ellipsis}
                              size="icon"
                            >
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <Can I="update" a={subjectUser}>
                              <DropdownMenuItem
                                onClick={() => editModalRef.current?.open(user)}
                              >
                                <Edit className="size-4" />
                                Editar
                              </DropdownMenuItem>
                            </Can>
                            <Can I="read" a={subjectUser}>
                              <DropdownMenuItem
                                onClick={() =>
                                  editModalRef.current?.open(user, true)
                                }
                              >
                                <View className="size-4" />
                                Visualizar
                              </DropdownMenuItem>
                            </Can>
                            <Can I="update" a={subjectUser}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleUserStatus(user.id, user.status)
                                }
                              >
                                {user.status === 'INACTIVE' ? (
                                  <ToggleRight className="size-4" />
                                ) : (
                                  <ToggleLeft className="size-4" />
                                )}
                                {user.status === 'INACTIVE'
                                  ? 'Ativar'
                                  : 'Desativar'}
                              </DropdownMenuItem>
                            </Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex items-center gap-2 justify-start">
                  <span>
                    Página {page} de {totalPages}
                  </span>
                </div>
              </TableCell>
              <TableCell colSpan={1} className="flex justify-end">
                <div className="flex items-center gap-2 justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1 || totalPages === 0}
                        >
                          <ChevronLeftIcon className="size-4" />
                        </Button>
                      </PaginationItem>

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages || totalPages === 0}
                        >
                          <ChevronRightIcon className="size-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <UserEditModal ref={editModalRef} />
    </div>
  )
}
