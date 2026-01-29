'use client'

import { useRouter } from '@bprogress/next'
import { deleteBoilerReportAction } from '@inspetor/actions/boiler/delete-boiler-report'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
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
import type { BoilerReport } from '@inspetor/generated/prisma/browser'
import { dayjsApi } from '@inspetor/lib/dayjs'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
  Inbox,
  Trash2Icon,
  View,
} from 'lucide-react'
import Link from 'next/link'
import { parseAsInteger, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { BoilerReportTypeBadge } from './boiler-report-type-badge'

type BoilerTableProps = {
  boilerReports: (BoilerReport & {
    client: { companyName: string }
    engineer: { name: string | null; username: string | null }
  })[]
  totalPages: number
}

export function BoilerTable({ boilerReports, totalPages }: BoilerTableProps) {
  const deleteAction = useServerAction(deleteBoilerReportAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  async function handlePageChange(page: number) {
    setPage(page)

    try {
      await invalidatePageCache('/dashboard/reports/boiler')
    } finally {
      router.refresh()
    }
  }

  async function handleDeleteBoilerReport(boilerReportId: string) {
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

      router.refresh()
    } else {
      toast.error(result?.message, {
        id: 'delete-boiler-report',
      })
    }
  }

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
                    <BoilerReportTypeBadge type={report.type} />
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
                    {report.createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" icon={Ellipsis} size="icon">
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/reports/boiler/${report.id}/view`}
                            >
                              <View className="size-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteBoilerReport(report.id)}
                          >
                            <Trash2Icon className="size-4" />
                            Excluir
                          </DropdownMenuItem>
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
    </div>
  )
}
