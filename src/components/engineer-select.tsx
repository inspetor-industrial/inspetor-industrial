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
  type EngineerOption,
  useEngineersForSelectQuery,
} from '@inspetor/hooks/use-engineers-query'
import { cn } from '@inspetor/lib/utils'
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

const SEARCH_PLACEHOLDER = 'Buscar engenheiro...'
const EMPTY_LABEL = 'Nenhum engenheiro encontrado.'
const TRIGGER_PLACEHOLDER = 'Selecione o engenheiro'

function getEngineerLabel(engineer: EngineerOption): string {
  return engineer.name ?? engineer.username ?? ''
}

type EngineerSelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  companyId?: string
}

export function EngineerSelect({
  value,
  onValueChange,
  disabled,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Engenheiro',
  companyId,
}: EngineerSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useEngineersForSelectQuery(companyId)
  const engineers = data?.engineers ?? []

  const selectedEngineer = engineers.find((e: EngineerOption) => e.id === value)

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
                  : selectedEngineer
                    ? getEngineerLabel(selectedEngineer)
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
                  {engineers.map((engineer) => (
                    <CommandItem
                      key={engineer.id}
                      value={getEngineerLabel(engineer)}
                      onSelect={() => {
                        onValueChange?.(
                          value === engineer.id ? '' : engineer.id,
                        )
                        setOpen(false)
                      }}
                    >
                      {getEngineerLabel(engineer)}
                      {value === engineer.id && (
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
