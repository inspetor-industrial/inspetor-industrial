'use client'

import { Can } from '@inspetor/casl/context'
import { CompanySelect } from '@inspetor/components/company-select'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { useSession } from '@inspetor/lib/auth/context'
import { BrushCleaning } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { ValveCreationModal } from './creation-modal'

export function ValveFilter() {
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
    <div className="@container/filter flex @items-center gap-2 @justify-between flex-col md:flex-row">
      <div className="flex gap-2 @items-center flex-col @md:flex-row w-full">
        <div className="flex gap-2">
          <Input
            placeholder="Pesquisar pelo número de série"
            className="w-96"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Pesquisar válvula pelo número de série"
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
        <Button
          type="button"
          className="md:ml-auto"
          icon={BrushCleaning}
          onClick={handleClearFilters}
        >
          Limpar filtros
        </Button>
        <Can I="create" a="ReportValve">
          <ValveCreationModal />
        </Can>
      </div>
    </div>
  )
}
