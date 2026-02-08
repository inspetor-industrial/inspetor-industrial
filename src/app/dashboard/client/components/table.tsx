'use client'

import { subject } from '@casl/ability'
import { deleteClientAction } from '@inspetor/actions/delete-client'
import { type Subjects } from '@inspetor/casl/ability'
import { Can, useAbility } from '@inspetor/casl/context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@inspetor/components/ui/alert-dialog'
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
import {
  type ClientListItem,
  getClientQueryKey,
  useClientQuery,
} from '@inspetor/hooks/use-client-query'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  Trash2Icon,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { ClientEditModal } from './edit-modal'
import { ClientTableSkeleton } from './table-skeleton'

export function ClientTable() {
  const deleteAction = useServerAction(deleteClientAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useClientQuery(search, page)
  const editModalRef = useRef<{
    open: (client: ClientListItem, isOnlyRead?: boolean) => void
  } | null>(null)
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null)
  const [conflictAlert, setConflictAlert] = useState<{
    open: boolean
    message: string
  }>({ open: false, message: '' })

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteClient(clientId: string) {
    setClientToDeleteId(null)

    const [result, resultError] = await deleteAction.execute({
      clientId,
    })

    if (resultError) {
      toast.error('Erro ao deletar cliente')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getClientQueryKey() })
      return
    }

    if (result?.others?.conflict) {
      setConflictAlert({ open: true, message: result.message ?? '' })
      return
    }

    toast.error(result?.message)
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar clientes.
      </div>
    )
  }

  if (isPending || !data) {
    return <ClientTableSkeleton />
  }

  const { clients, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Empresa</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ/CPF</TableHead>
              <TableHead>Inscrição estadual</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum cliente encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {clients.map((client) => {
              const subjectClient = subject('Client', {
                companyId: client.companyId ?? undefined,
              }) as unknown as Subjects
              const showActions =
                ability.can('update', subjectClient) ||
                ability.can('read', subjectClient) ||
                ability.can('delete', subjectClient)

              return (
                <TableRow key={client.id} className="divide-x">
                  <TableCell>{client.company?.name ?? '-'}</TableCell>
                  <TableCell>{client.companyName}</TableCell>
                  <TableCell>{client.taxId}</TableCell>
                  <TableCell>{client.taxRegistration}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    {client.createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                            <Can I="update" a={subjectClient}>
                              <DropdownMenuItem
                                onClick={() =>
                                  editModalRef.current?.open(client)
                                }
                              >
                                <Edit className="size-4" />
                                Editar
                              </DropdownMenuItem>
                            </Can>
                            <Can I="read" a={subjectClient}>
                              <DropdownMenuItem
                                onClick={() =>
                                  editModalRef.current?.open(client, true)
                                }
                              >
                                <View className="size-4" />
                                Visualizar
                              </DropdownMenuItem>
                            </Can>
                            <Can I="delete" a={subjectClient}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setClientToDeleteId(client.id)}
                              >
                                <Trash className="size-4" />
                                Excluir
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
              <TableCell colSpan={6}>
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

      <ClientEditModal ref={editModalRef} />

      <AlertDialog
        open={clientToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setClientToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-destructive hover:bg-destructive/90"
                variant="destructive"
                onClick={() =>
                  clientToDeleteId !== null &&
                  handleDeleteClient(clientToDeleteId)
                }
              >
                <Trash2Icon /> Sim, excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={conflictAlert.open}
        onOpenChange={(open) => {
          if (!open) setConflictAlert({ open: false, message: '' })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível excluir</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setConflictAlert({ open: false, message: '' })}
            >
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
