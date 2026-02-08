'use client'

import { Can } from '@inspetor/casl/context'
import { Input } from '@inspetor/components/ui/input'
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

  return (
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <div className="flex gap-2 @items-center flex-col @md:flex-row w-full">
        <Input
          placeholder="Pesquisar pelo nome"
          className="w-full"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Pesquisar empresa pelo nome"
        />
        <Can I="create" a="Company">
          <CompanyCreationModal />
        </Can>
      </div>
    </div>
  )
}
