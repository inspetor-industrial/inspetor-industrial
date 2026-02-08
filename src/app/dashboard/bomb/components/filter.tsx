'use client'

import { Can } from '@inspetor/casl/context'
import { CompanySelect } from '@inspetor/components/company-select'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { useSession } from '@inspetor/lib/auth/context'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { BombCreationModal } from './creation-modal'

export function BombFilter() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [companyId, setCompanyId] = useQueryState(
    'companyId',
    parseAsString.withDefault(''),
  )
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleCompanyChange(value: string) {
    setCompanyId(value)
    setPage(1)
  }

  function handleClearFilters() {
    setSearch('')
    setCompanyId('')
    setPage(1)
  }

  return (
    <div className="@container/filter flex md:items-center gap-2 md:justify-between flex-col md:flex-row">
      <div className="flex gap-2 items-center flex-col md:flex-row w-full md:w-1/2">
        <div className="flex gap-2 flex-col sm:flex-row w-full">
          <Input
            placeholder="Pesquisar pela marca"
            className="w-full"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Pesquisar bomba pela marca"
          />
          {isAdmin && (
            <CompanySelect
              value={companyId}
              onValueChange={handleCompanyChange}
              placeholder="Filtrar por empresa"
              label="Empresa"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
        <Button
          type="button"
          className="w-full md:w-auto"
          icon={BrushCleaning}
          onClick={handleClearFilters}
        >
          Limpar filtros
        </Button>
        <Can I="create" a="ReportBomb">
          <div className="w-full md:w-auto">
            <BombCreationModal />
          </div>
        </Can>
      </div>
    </div>
  )
}
