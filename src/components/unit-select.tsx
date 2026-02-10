'use client'

import { useCompanyUnitsForSelectQuery } from '@inspetor/hooks/use-company-units-query'
import { useId } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Loader2 } from 'lucide-react'

const EMPTY_OPTION_VALUE = '__none__'
const PLACEHOLDER_NO_COMPANY = 'Selecione uma empresa'
const PLACEHOLDER_NO_UNITS = 'Nenhuma unidade cadastrada'
const PLACEHOLDER_SELECT = 'Selecione a unidade'
const READONLY_EMPTY_LABEL = 'Não atribuído'
const EMPTY_SELECT_LABEL = 'Não atribuído'

type UnitSelectProps = {
  companyId: string
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  allowEmpty?: boolean
  label?: string
}

export function UnitSelect({
  companyId,
  value,
  onChange,
  disabled,
  readOnly,
  placeholder = PLACEHOLDER_SELECT,
  allowEmpty = true,
  label = 'Unidade',
}: UnitSelectProps) {
  const id = useId()

  const { data, isLoading, isError } = useCompanyUnitsForSelectQuery(
    companyId ? companyId : null,
  )
  const units = data?.units ?? []
  const hasNoUnits = companyId && units.length === 0

  function handleValueChange(val: string) {
    if (val === EMPTY_OPTION_VALUE || val === '') {
      onChange(null)
    } else {
      onChange(val)
    }
  }

  const selectValue =
    value != null && value !== '' ? value : EMPTY_OPTION_VALUE

  if (readOnly) {
    const unitName =
      value != null && value !== ''
        ? units.find((u) => u.id === value)?.name ?? null
        : null

    return (
      <div
        id={id}
        role="status"
        aria-label={label}
        className="rounded-md border border-input bg-muted/30 px-3 py-2.5 min-h-10 flex items-center"
      >
        {isLoading ? (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2
              className="size-4 animate-spin shrink-0"
              aria-hidden
            />
            Carregando...
          </span>
        ) : (
          <span className="text-sm">
            {unitName ?? READONLY_EMPTY_LABEL}
          </span>
        )}
      </div>
    )
  }

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={
        disabled || isError || !companyId || hasNoUnits || isLoading
      }
    >
      <SelectTrigger id={id} aria-label={label}>
        <SelectValue
          placeholder={
            !companyId
              ? PLACEHOLDER_NO_COMPANY
              : hasNoUnits
                ? PLACEHOLDER_NO_UNITS
                : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value={EMPTY_OPTION_VALUE}>
            {EMPTY_SELECT_LABEL}
          </SelectItem>
        )}
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
