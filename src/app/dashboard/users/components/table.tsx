'use client'

import { useRouter } from '@bprogress/next'
import { toggleUserStatusAction } from '@inspetor/actions/toggle-user-status'
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
import { cn } from '@inspetor/lib/utils'
import type { User, UserStatus } from '@prisma/client'
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
import { parseAsInteger, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { UserEditModal } from './edit-modal'

type UserWithCompany = User & {
  company: {
    name: string
  }
}

type UserTableProps = {
  users: UserWithCompany[]
  totalPages: number
}

export function UserTable({ users, totalPages }: UserTableProps) {
  const toggleStatusAction = useServerAction(toggleUserStatusAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const editModalRef = useRef<any>(null)

  function handlePageChange(page: number) {
    setPage(page)
  }

  async function handleToggleUserStatus(userId: string, status: UserStatus) {
    const [result, resultError] = await toggleStatusAction.execute({
      userId,
      status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    })

    if (resultError) {
      console.log(resultError)
      toast.error('Erro ao atualizar status do usuário')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }
  }

  return (
    <div className="overflow-x-auto rounded border">
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

          {users.map((user) => (
            <TableRow key={user.id} className="divide-x">
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.company?.name}</TableCell>
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
                <div className="flex justify-center items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" icon={Ellipsis} size="icon">
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => editModalRef.current.open(user)}
                      >
                        <Edit className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => editModalRef.current.open(user, true)}
                      >
                        <View className="size-4" />
                        Visualizar
                      </DropdownMenuItem>

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
                        {user.status === 'INACTIVE' ? 'Ativar' : 'Desativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
                        disabled={page === 1}
                      >
                        <ChevronLeftIcon className="size-4" />
                      </Button>
                    </PaginationItem>

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
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

      <UserEditModal ref={editModalRef} />
    </div>
  )
}
