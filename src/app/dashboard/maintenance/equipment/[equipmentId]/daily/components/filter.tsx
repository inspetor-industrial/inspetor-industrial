'use client'

import { Can } from '@inspetor/casl/context'
import { Input } from '@inspetor/components/ui/input'
import type { Equipment } from '@inspetor/generated/prisma/browser'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
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
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [searchCache, setSearchCache] = useState(search)

  useEffect(() => {
    setSearchCache(search)
  }, [search])

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

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
