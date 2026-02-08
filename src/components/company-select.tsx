'use client'

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
import {
  type CompanyOption,
  useCompaniesForSelectQuery,
} from '@inspetor/hooks/use-companies-query'
import { cn } from '@inspetor/lib/utils'
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

const SEARCH_PLACEHOLDER = 'Buscar empresa...'
const EMPTY_LABEL = 'Nenhuma empresa encontrada.'
const TRIGGER_PLACEHOLDER = 'Selecione uma empresa'

type CompanySelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
}

export function CompanySelect({
  value,
  onValueChange,
  disabled,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Empresa',
}: CompanySelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useCompaniesForSelectQuery()
  const companies = data?.companies ?? []

  const selectedCompany = companies.find((c: CompanyOption) => c.id === value)

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
            disabled={disabled || isError}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <p
                className={cn(
                  'truncate',
                  !value && 'text-muted-foreground',
                  isLoading && 'text-muted-foreground/80',
                )}
              >
                {isLoading
                  ? 'Carregando...'
                  : selectedCompany
                    ? selectedCompany.name
                    : placeholder}
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
              <CommandList>
                <CommandEmpty>{EMPTY_LABEL}</CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      onSelect={() => {
                        onValueChange?.(value === company.id ? '' : company.id)
                        setOpen(false)
                      }}
                    >
                      {company.name}
                      {value === company.id && (
                        <CheckIcon size={16} className="ml-auto" />
                      )}
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
