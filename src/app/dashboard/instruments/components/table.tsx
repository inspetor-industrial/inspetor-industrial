'use client'

import { useRouter } from '@bprogress/next'
import { deleteInstrumentAction } from '@inspetor/actions/delete-instrument'
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
import { INSTRUMENT_TYPE } from '@inspetor/constants/instrument-type'
import { cn } from '@inspetor/lib/utils'
import type { Instruments } from '@inspetor/generated/prisma/browser'
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

import { InstrumentEditModal } from './edit-modal'

type InstrumentTableProps = {
  instruments: Instruments[]
  totalPages: number
}

export function InstrumentTable({
  instruments,
  totalPages,
}: InstrumentTableProps) {
  const deleteAction = useServerAction(deleteInstrumentAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const editModalRef = useRef<any>(null)

  async function handlePageChange(page: number) {
    setPage(page)

    try {
      await invalidatePageCache('/dashboard/instruments')
    } finally {
      router.refresh()
    }
  }

  async function handleDeleteInstrument(instrumentId: string) {
    toast.loading('Deletando instrumento...', {
      id: 'delete-instrument',
    })
    const [result, resultError] = await deleteAction.execute({
      instrumentId,
    })

    if (resultError) {
      toast.error('Erro ao deletar instrumento', {
        id: 'delete-instrument',
      })
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-instrument',
      })
      router.refresh()
    } else {
      toast.error(result?.message, {
        id: 'delete-instrument',
      })
    }
  }

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Número de série</TableHead>
              <TableHead>Número de certificado</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de validade</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instruments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum instrumento encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {instruments.map((instrument) => (
              <TableRow key={instrument.id} className="divide-x">
                <TableCell>{instrument.serialNumber}</TableCell>
                <TableCell>{instrument.certificateNumber}</TableCell>
                <TableCell>{instrument.manufacturer}</TableCell>
                <TableCell>
                  {
                    INSTRUMENT_TYPE[
                      instrument.type as keyof typeof INSTRUMENT_TYPE
                    ]
                  }
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      'capitalize',
                      instrument.validationDate > new Date() && 'bg-green-500',
                      instrument.validationDate < new Date() && 'bg-red-500',
                      instrument.validationDate === new Date() &&
                        'bg-yellow-500',
                    )}
                  >
                    {instrument.validationDate > new Date()
                      ? 'Válido'
                      : instrument.validationDate === new Date()
                        ? 'Vencendo'
                        : 'Inválido'}
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
                          onClick={() => editModalRef.current.open(instrument)}
                        >
                          <Edit className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            editModalRef.current.open(instrument, true)
                          }
                        >
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDeleteInstrument(instrument.id)}
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

      <InstrumentEditModal ref={editModalRef} />
    </div>
  )
}
