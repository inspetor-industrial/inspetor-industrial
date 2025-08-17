'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { useDebouncedCallback } from '@mantine/hooks'
import { BrushCleaning } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { UserCreationModal } from './creation-modal'

export function UserFilter() {
  const [searchCache, setSearchCache] = useState('')
  const [, setSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault(''),
  )

  const router = useRouter()

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setSearch(value)

    try {
      await invalidatePageCache('/dashboard/users')
    } finally {
      router.refresh()
    }
  }, 300)

  async function handleStatusChange(value: string) {
    setStatus(value)

    try {
      await invalidatePageCache('/dashboard/users')
    } finally {
      router.refresh()
    }
  }

  async function handleClearFilters() {
    setSearch('')
    setStatus('')

    try {
      await invalidatePageCache('/dashboard/users')
    } finally {
      router.refresh()
    }
  }

  return (
    <div className="flex sm:items-center gap-2 sm:justify-between flex-col sm:flex-row">
      <div className="flex gap-2 sm:items-center flex-col sm:flex-row ">
        <Input
          placeholder="Pesquisar pelo nome"
          className="w-full sm:w-96"
          value={searchCache}
          onChange={(e) => {
            setSearchCache(e.target.value)
            handleSearch(e.target.value)
          }}
        />
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="sm:w-96 w-full">
            <SelectValue placeholder="Selecionar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Button icon={BrushCleaning} onClick={handleClearFilters}>
          Limpar filtros
        </Button>
      </div>

      <UserCreationModal />
    </div>
  )
}
