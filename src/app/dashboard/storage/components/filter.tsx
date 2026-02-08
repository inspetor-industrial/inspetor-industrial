'use client'

import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { StorageCreationModal } from './creation-modal'

export function StorageFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  function handleClearFilters() {
    setSearchCache('')
    setSearch('')
    setPage(1)
  }

  return (
    <div className="@container/filter flex md:items-center gap-2 md:justify-between flex-col md:flex-row">
      <div className="flex gap-2 items-center flex-col md:flex-row w-full md:w-1/2">
        <Input
          placeholder="Pesquisar pelo nome da empresa"
          className="w-full"
          value={searchCache}
          onChange={(e) => {
            setSearchCache(e.target.value)
            handleSearch(e.target.value)
          }}
          aria-label="Pesquisar pasta pelo nome da empresa"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
        <Button
          type="button"
          className="w-full md:w-auto"
          icon={BrushCleaning}
          onClick={handleClearFilters}
        >
          Limpar filtros
        </Button>
        <div className="w-full md:w-auto">
          <StorageCreationModal />
        </div>
      </div>
    </div>
  )
}
