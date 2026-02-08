'use client'

import { Can } from '@inspetor/casl/context'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { UserCreationModal } from './creation-modal'

export function UserFilter() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )

  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('__all__'),
  )

  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatus(value)
    setPage(1)
  }

  function handleClearFilters() {
    setSearch('')
    setStatus('__all__')
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
        />
        <Select onValueChange={handleStatusChange} value={status || '__all__'}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Button icon={BrushCleaning} onClick={handleClearFilters}>
          Limpar filtros
        </Button>
      </div>

      <Can I="create" a="User">
        <UserCreationModal />
      </Can>
    </div>
  )
}
