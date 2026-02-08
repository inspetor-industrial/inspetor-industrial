'use client'

import { Can } from '@inspetor/casl/context'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import type { Equipment } from '@inspetor/generated/prisma/browser'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

import { DailyMaintenanceCreationModal } from './creation-modal'

type DailyMaintenanceFilterProps = {
  equipment: Equipment
}

export function DailyMaintenanceFilter({
  equipment,
}: DailyMaintenanceFilterProps) {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [searchCache, setSearchCache] = useState(search)

  useEffect(() => {
    setSearchCache(search)
  }, [search])

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  return (
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <Input
        placeholder="Pesquisar por operador ou descrição"
        className="w-full"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <Can I="create" a="MaintenanceDaily">
        <DailyMaintenanceCreationModal equipment={equipment} />
      </Can>
    </div>
  )
}
