'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

// import { CompanyCreationModal } from './creation-modal'

export function BoilerFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))

  const router = useRouter()

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setSearch(value)

    try {
      await invalidatePageCache('/dashboard/reports/boiler')
    } finally {
      router.refresh()
    }
  }, 300)

  return (
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <Input
        placeholder="Pesquisar pelo número do relatório (ex: 1234567890)"
        className="w-full"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <Link href="/dashboard/reports/boiler/editor">
        <Button>
          <Plus />
          Novo relatório
        </Button>
      </Link>
    </div>
  )
}
