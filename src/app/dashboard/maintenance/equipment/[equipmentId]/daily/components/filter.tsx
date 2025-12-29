'use client'

import type { Equipment } from '@inspetor/generated/prisma/browser'

import { DailyMaintenanceCreationModal } from './creation-modal'

type DailyMaintenanceFilterProps = {
  equipment: Equipment
}

export function DailyMaintenanceFilter({
  equipment,
}: DailyMaintenanceFilterProps) {
  return (
    <div className="@container/filter flex @items-center gap-2 justify-end @justify-between flex-col md:flex-row">
      {/* <Input
        placeholder="Pesquisar pelo equipamento"
        className="w-full"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      /> */}

      <DailyMaintenanceCreationModal equipment={equipment} />
    </div>
  )
}
