'use client'

import { useRouter } from '@bprogress/next'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { StorageCreationModal } from './creation-modal'

export function StorageFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))

  const router = useRouter()

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value)

    router.refresh()
  }, 300)

  return (
    <div className="flex sm:items-center gap-2 justify-between flex-col sm:flex-row">
      <Input
        placeholder="Pesquisar pelo nome da empresa"
        className="w-full sm:w-96"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <StorageCreationModal />
    </div>
  )
}
