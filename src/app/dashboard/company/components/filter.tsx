'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { CompanyCreationModal } from './creation-modal'

export function CompanyFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))

  const router = useRouter()

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setSearch(value)

    try {
      await invalidatePageCache('/dashboard/company')
    } finally {
      router.refresh()
    }
  }, 300)

  return (
    <div className="flex sm:items-center gap-2 justify-between flex-col sm:flex-row">
      <Input
        placeholder="Pesquisar pelo nome"
        className="w-full sm:w-96"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <CompanyCreationModal />
    </div>
  )
}
