'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { useDebouncedCallback } from '@mantine/hooks'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

// import { CompanyCreationModal } from './creation-modal'

export function BoilerFilter() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [searchCache, setSearchCache] = useState(search)

  const router = useRouter()

  useEffect(() => {
    setSearchCache(search)
  }, [search])

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
        placeholder="Pesquisar pelo nome da empresa do relatório (ex: Empresa Exemplo)"
        className="w-full"
        value={searchCache}
        onChange={(e) => {
          setSearchCache(e.target.value)
          handleSearch(e.target.value)
        }}
      />

      <Link href="/dashboard/reports/boiler/creation">
        <Button>
          <Plus />
          Novo relatório
        </Button>
      </Link>
    </div>
  )
}
