'use client'

import { subject } from '@casl/ability'
import { deleteCompanyAction } from '@inspetor/actions/delete-company'
import type { Subjects } from '@inspetor/casl/ability'
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
import {
  type CompanyListItem,
  getCompaniesQueryKey,
  useCompaniesQuery,
} from '@inspetor/hooks/use-companies-query'
import { cn } from '@inspetor/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  Trash2Icon,
  View,
} from 'lucide-react'
import Link from 'next/link'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { CompanyEditModal } from './edit-modal'
import { CompanyTableSkeleton } from './table-skeleton'

export function CompanyTable() {
  const deleteAction = useServerAction(deleteCompanyAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useCompaniesQuery(search, page)
  const editModalRef = useRef<{
    open: (company: CompanyListItem, isOnlyRead?: boolean) => void
  } | null>(null)
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(
    null,
  )
  const [conflictAlert, setConflictAlert] = useState<{
    open: boolean
    message: string
  }>({ open: false, message: '' })

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteCompany(companyId: string) {
    setCompanyToDeleteId(null)

    toast.loading('Deletando empresa...', {
      id: 'delete-company',
    })
    const [result, resultError] = await deleteAction.execute({
      companyId,
    })

    if (resultError) {
      toast.error('Erro ao deletar empresa', {
        id: 'delete-company',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-company',
      })
      await queryClient.invalidateQueries({ queryKey: getCompaniesQueryKey() })
      return
    }

    if (result?.others?.conflict) {
      toast.dismiss('delete-company')
      setConflictAlert({ open: true, message: result.message ?? '' })
      return
    }

    toast.error(result?.message, {
      id: 'delete-company',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar empresas.
      </div>
    )
  }

  if (isPending || !data) {
    return <CompanyTableSkeleton />
  }

  const { companies, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma empresa encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {companies.map((company) => {
              const subjectCompany = subject(
                'Company',
                company,
              ) as unknown as Subjects
              const subjectCompanyUnit = subject('CompanyUnit', {
                companyId: company.id,
              }) as unknown as Subjects
              const canUpdate = ability.can('update', subjectCompany)
              const canDelete = ability.can('delete', subjectCompany)
              const canReadUnits = ability.can('read', subjectCompanyUnit)

              return (
                <TableRow key={company.id} className="divide-x">
                  <TableCell>{company.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'capitalize',
                        company.status === 'ACTIVE' && 'bg-green-500',
                        company.status === 'INACTIVE' && 'bg-red-500',
                      )}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            icon={Ellipsis}
                            size="icon"
                          >
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {canUpdate && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(company)
                              }
                            >
                              <Edit className="size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canUpdate && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(company, true)
                              }
                            >
                              <View className="size-4" />
                              Visualizar
                            </DropdownMenuItem>
                          )}
                          {canReadUnits && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/company/${company.id}/units`}
                              >
                                <Building2 className="size-4" />
                                Unidades
                              </Link>
                            </DropdownMenuItem>
                          )}

                          {canUpdate && canDelete && <DropdownMenuSeparator />}

                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => setCompanyToDeleteId(company.id)}
                            >
                              <Trash className="size-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>
                <div className="flex items-center gap-2 justify-start">
                  <span>
                    Página {page} de {totalPages}
                  </span>
                </div>
              </TableCell>
              <TableCell colSpan={1} className="flex justify-end">
                <div className="flex gap-2 justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          type="button"
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
                          type="button"
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

      <CompanyEditModal ref={editModalRef} />

      <AlertDialog
        open={companyToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setCompanyToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                className="bg-destructive hover:bg-destructive/90"
                variant="destructive"
                onClick={() =>
                  companyToDeleteId !== null &&
                  handleDeleteCompany(companyToDeleteId)
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
