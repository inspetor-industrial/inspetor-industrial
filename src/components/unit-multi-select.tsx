'use client'

import { Badge } from '@inspetor/components/ui/badge'
import { Button } from '@inspetor/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@inspetor/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@inspetor/components/ui/popover'
import { useCompanyUnitsForSelectQuery } from '@inspetor/hooks/use-company-units-query'
import { cn } from '@inspetor/lib/utils'
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

const SEARCH_PLACEHOLDER = 'Buscar unidade...'
const EMPTY_LABEL = 'Nenhuma unidade encontrada.'
const TRIGGER_PLACEHOLDER = 'Selecione as unidades'
const SELECT_ALL_LABEL = 'Selecionar todas'
const CLEAR_LABEL = 'Limpar'
const READONLY_EMPTY_LABEL = 'Nenhuma unidade permitida.'

type UnitMultiSelectProps = {
  companyId: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  label?: string
}

export function UnitMultiSelect({
  companyId,
  value,
  onChange,
  disabled,
  readOnly,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Unidades',
}: UnitMultiSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useCompanyUnitsForSelectQuery(
    companyId ? companyId : null,
  )
  const units = data?.units ?? []

  const isAllSelected =
    units.length > 0 && value.length === units.length
  const isNoneSelected = value.length === 0

  function handleSelectUnit(unitId: string) {
    if (value.includes(unitId)) {
      onChange(value.filter((id) => id !== unitId))
    } else {
      onChange([...value, unitId])
    }
  }

  function handleSelectAll() {
    if (isAllSelected) {
      onChange([])
    } else {
      onChange(units.map((u) => u.id))
    }
  }

  function handleClear() {
    onChange([])
  }

  const triggerLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? units.find((u) => u.id === value[0])?.name ?? `${value.length} unidade`
        : `${value.length} unidades`

  if (readOnly) {
    const selectedUnits = value
      .map((id) => units.find((u) => u.id === id)?.name)
      .filter((name): name is string => Boolean(name))

    return (
      <div
        id={id}
        role="status"
        aria-label={label}
        className="rounded-md border border-input bg-muted/30 px-3 py-2.5 min-h-10"
      >
        {isLoading ? (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2
              className="size-4 animate-spin shrink-0"
              aria-hidden
            />
            Carregando...
          </span>
        ) : value.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            {READONLY_EMPTY_LABEL}
          </span>
        ) : (
          <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
            {selectedUnits.map((name) => (
              <li key={name}>
                <Badge variant="secondary" className="font-normal">
                  {name}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="[&>div]:first:w-full bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            disabled={disabled || isError || !companyId}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <p
                className={cn(
                  'truncate',
                  value.length === 0 && 'text-muted-foreground',
                  isLoading && 'text-muted-foreground/80',
                )}
              >
                {isLoading
                  ? 'Carregando...'
                  : !companyId
                    ? 'Selecione uma empresa'
                    : triggerLabel}
              </p>
              {isLoading ? (
                <Loader2
                  className="size-4 shrink-0 ml-auto animate-spin text-muted-foreground/80"
                  aria-hidden
                />
              ) : (
                <ChevronDownIcon
                  size={16}
                  className="text-muted-foreground/80 shrink-0 ml-auto"
                  aria-hidden
                />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-(--radix-popper-anchor-width) p-0"
          align="start"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2
                className="size-4 animate-spin text-muted-foreground/80"
                aria-hidden
              />
            </div>
          ) : (
            <Command>
              <CommandInput placeholder={SEARCH_PLACEHOLDER} />
              <div className="flex gap-2 p-2 border-b border-input">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleSelectAll}
                  disabled={units.length === 0}
                >
                  {SELECT_ALL_LABEL}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleClear}
                  disabled={isNoneSelected}
                >
                  {CLEAR_LABEL}
                </Button>
              </div>
              <CommandList>
                <CommandEmpty>{EMPTY_LABEL}</CommandEmpty>
                <CommandGroup>
                  {units.map((unit) => (
                    <CommandItem
                      key={unit.id}
                      value={unit.name}
                      onSelect={() => handleSelectUnit(unit.id)}
                    >
                      {unit.name}
                      {value.includes(unit.id) ? (
                        <CheckIcon size={16} className="ml-auto" />
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
