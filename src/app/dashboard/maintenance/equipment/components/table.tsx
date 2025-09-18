'use client'

import { useRouter } from '@bprogress/next'
import { deleteEquipmentAction } from '@inspetor/actions/delete-equipment'
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
import type { Company, Equipment } from '@prisma/client'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Notebook,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { EquipmentEditModal } from './edit-modal'

type EquipmentWithCompany = Equipment & {
  company: Company
}

type EquipmentTableProps = {
  equipments: EquipmentWithCompany[]
  totalPages: number
}

export function EquipmentTable({
  equipments,
  totalPages,
}: EquipmentTableProps) {
  const deleteAction = useServerAction(deleteEquipmentAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const editModalRef = useRef<any>(null)

  async function handlePageChange(page: number) {
    setPage(page)

    try {
      await invalidatePageCache('/dashboard/maintenance/equipment')
    } finally {
      router.refresh()
    }
  }

  async function handleDeleteEquipment(equipmentId: string) {
    toast.loading('Deletando equipamento...', {
      id: 'delete-equipment',
    })
    const [result, resultError] = await deleteAction.execute({
      equipmentId,
    })

    if (resultError) {
      toast.error('Erro ao deletar equipamento', {
        id: 'delete-equipment',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-equipment',
      })
      router.refresh()
    } else {
      toast.error(result?.message, {
        id: 'delete-equipment',
      })
    }
  }

  function handleRedirectToDailyMaintenance(equipmentId: string) {
    router.push(`/dashboard/maintenance/equipment/${equipmentId}/daily`)
  }

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Empresa</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Número de identificação</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Data de atualização</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum equipamento encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {equipments.map((equipment) => (
              <TableRow key={equipment.id} className="divide-x">
                <TableCell>{equipment.company.name}</TableCell>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>{equipment.mark}</TableCell>
                <TableCell>{equipment.identificationNumber}</TableCell>
                <TableCell>
                  {equipment.createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {equipment.updatedAt.toLocaleDateString('pt-BR', {
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
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => editModalRef.current.open(equipment)}
                        >
                          <Edit className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            editModalRef.current.open(equipment, true)
                          }
                        >
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleRedirectToDailyMaintenance(equipment.id)
                          }
                        >
                          <Notebook className="size-4" />
                          Manutenções diárias
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDeleteEquipment(equipment.id)}
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
      <EquipmentEditModal ref={editModalRef} />
    </div>
  )
}
