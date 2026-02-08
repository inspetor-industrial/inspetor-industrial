'use client'

import { Can } from '@inspetor/casl/context'
import { Input } from '@inspetor/components/ui/input'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { ClientCreationModal } from './creation-modal'

export function ClientFilter() {
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
    <div className="@container/filter flex md:items-center gap-2 md:justify-between flex-col md:flex-row">
      <Input
        placeholder="Pesquisar pelo nome"
        className="w-full md:w-1/2"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      <Can I="create" a="Client">
        <ClientCreationModal />
      </Can>
    </div>
  )
}
