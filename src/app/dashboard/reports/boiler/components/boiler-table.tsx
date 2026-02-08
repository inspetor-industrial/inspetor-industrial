'use client'

import { subject } from '@casl/ability'
import { deleteBoilerReportAction } from '@inspetor/actions/boiler/delete-boiler-report'
import type { Subjects } from '@inspetor/casl/ability'
import { useAbility } from '@inspetor/casl/context'
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
import type { BoilerReportType } from '@inspetor/generated/prisma/enums'
import {
  getBoilerReportsQueryKey,
  useBoilerReportsQuery,
} from '@inspetor/hooks/use-boiler-reports-query'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
  Inbox,
  Trash2Icon,
  View,
} from 'lucide-react'
import Link from 'next/link'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { BoilerReportTypeBadge } from './boiler-report-type-badge'
import { BoilerTableSkeleton } from './boiler-table-skeleton'

export function BoilerTable() {
  const deleteAction = useServerAction(deleteBoilerReportAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [companyId] = useQueryState('companyId', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useBoilerReportsQuery(
    search,
    page,
    companyId,
  )
  const [reportToDeleteId, setReportToDeleteId] = useState<string | null>(null)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteBoilerReport(boilerReportId: string) {
    setReportToDeleteId(null)

    toast.loading('Deletando relatório de inspeção de caldeira...', {
      id: 'delete-boiler-report',
    })

    const [result, resultError] = await deleteAction.execute({
      boilerReportId,
    })

    if (resultError) {
      toast.error('Erro ao deletar relatório de inspeção de caldeira', {
        id: 'delete-boiler-report',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-boiler-report',
      })
      await queryClient.invalidateQueries({
        queryKey: getBoilerReportsQueryKey(),
      })
      return
    }

    toast.error(result?.message, {
      id: 'delete-boiler-report',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar relatórios.
      </div>
    )
  }

  if (isPending || !data) {
    return <BoilerTableSkeleton />
  }

  const { boilerReports, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Próxima inspeção</TableHead>
              <TableHead>Engenheiro</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boilerReports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum relatório encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {boilerReports.map((report) => {
              const subjectReport = subject('ReportBoiler', {
                companyId: report.companyId,
              }) as unknown as Subjects
              const canRead = ability.can('read', subjectReport)
              const canDelete = ability.can('delete', subjectReport)
              const engineerName =
                report.engineer.name ??
                report.engineer.username ??
                'Não informado'

              return (
                <TableRow key={report.id} className="divide-x">
                  <TableCell className="font-medium">
                    {report.client.companyName}
                  </TableCell>
                  <TableCell>
                    <BoilerReportTypeBadge
                      type={report.type as BoilerReportType}
                    />
                  </TableCell>
                  <TableCell>
                    {report.date
                      ? dayjsApi(report.date).format('DD/MM/YYYY')
                      : 'Não informado'}
                  </TableCell>
                  <TableCell>
                    {report.nextInspectionDate
                      ? dayjsApi(report.nextInspectionDate).format('DD/MM/YYYY')
                      : 'Não informado'}
                  </TableCell>
                  <TableCell>{engineerName}</TableCell>
                  <TableCell>
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
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
                          {canRead && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/reports/boiler/${report.id}/view`}
                              >
                                <View className="size-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canRead && canDelete && <DropdownMenuSeparator />}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => setReportToDeleteId(report.id)}
                            >
                              <Trash2Icon className="size-4" />
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
              <TableCell colSpan={6}>
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

      <AlertDialog
        open={reportToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setReportToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir relatório?</AlertDialogTitle>
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
                  reportToDeleteId !== null &&
                  handleDeleteBoilerReport(reportToDeleteId)
                }
              >
                <Trash2Icon /> Sim, excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
