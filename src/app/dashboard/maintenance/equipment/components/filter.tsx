'use client'

import { Can } from '@inspetor/casl/context'
import { Input } from '@inspetor/components/ui/input'
import { parseAsString, useQueryState } from 'nuqs'

import { EquipmentCreationModal } from './creation-modal'

export function EquipmentFilter() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )

  return (
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <Input
        placeholder="Pesquisar pelo nome"
        className="w-full"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
        }}
      />

      <Can I="create" a="MaintenanceEquipment">
        <EquipmentCreationModal />
      </Can>
    </div>
  )
}
