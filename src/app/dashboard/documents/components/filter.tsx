'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { DocumentsCreationModal } from './creation-modal'

export function DocumentsFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))

  const router = useRouter()

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setSearch(value)

    try {
      await invalidatePageCache('/dashboard/documents')
    } finally {
      router.refresh()
    }
  }, 300)

  return (
    <div className="@container/filter flex md:items-center gap-2 md:justify-between flex-col md:flex-row">
      <Input
        placeholder="Pesquisar pelo nome"
        className="w-full md:w-1/2"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <DocumentsCreationModal />
    </div>
  )
}
