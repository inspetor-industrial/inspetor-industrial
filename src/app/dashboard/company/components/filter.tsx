'use client'

import { Can } from '@inspetor/casl/context'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { CompanyCreationModal } from './creation-modal'

export function CompanyFilter() {
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
    <div className="@container/filter w-full flex gap-2 items-center justify-between flex-col md:flex-row">
      <div className="flex gap-2 items-center justify-between flex-col md:flex-row w-full">
        <Input
          placeholder="Pesquisar pelo nome"
          className="md:w-1/2"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Pesquisar empresa pelo nome"
        />

        <div className="flex flex-col md:flex-row gap-2 @items-center w-full md:w-auto">
          <Button
            type="button"
            icon={BrushCleaning}
            onClick={handleClearFilters}
          >
            Limpar filtros
          </Button>
          <Can I="create" a="Company">
            <CompanyCreationModal />
          </Can>
        </div>
      </div>
    </div>
  )
}
