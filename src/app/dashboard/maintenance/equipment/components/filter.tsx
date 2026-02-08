'use client'

import { Can } from '@inspetor/casl/context'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { EquipmentCreationModal } from './creation-modal'

export function EquipmentFilter() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleClearFilters() {
    setSearch('')
    setPage(1)
  }

  return (
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <div className="flex gap-2 @items-center flex-col @md:flex-row w-full">
        <Input
          placeholder="Pesquisar pelo nome"
          className="w-full"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Button type="button" icon={BrushCleaning} onClick={handleClearFilters}>
          Limpar filtros
        </Button>
      </div>

      <Can I="create" a="MaintenanceEquipment">
        <EquipmentCreationModal />
      </Can>
    </div>
  )
}
