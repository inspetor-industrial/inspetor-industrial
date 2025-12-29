'use client'

import { useRouter } from '@bprogress/next'
import { deleteCompanyAction } from '@inspetor/actions/delete-company'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
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
import type { Company } from '@inspetor/generated/prisma/browser'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { CompanyEditModal } from './edit-modal'

type CompanyTableProps = {
  companies: Company[]
  totalPages: number
}

export function CompanyTable({ companies, totalPages }: CompanyTableProps) {
  const deleteAction = useServerAction(deleteCompanyAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const editModalRef = useRef<any>(null)

  async function handlePageChange(page: number) {
    setPage(page)

    try {
      await invalidatePageCache('/dashboard/company')
    } finally {
      router.refresh()
    }
  }

  async function handleDeleteCompany(companyId: string) {
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
      router.refresh()
    } else {
      toast.error(result?.message, {
        id: 'delete-company',
      })
    }
  }

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

            {companies.map((company) => (
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
                        <Button variant="outline" icon={Ellipsis} size="icon">
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => editModalRef.current.open(company)}
                        >
                          <Edit className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            editModalRef.current.open(company, true)
                          }
                        >
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash className="size-4" />
                          Excluir
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
              <TableCell colSpan={2}>
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

      <CompanyEditModal ref={editModalRef} />
    </div>
  )
}
