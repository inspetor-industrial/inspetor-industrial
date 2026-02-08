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
  useClientsForSelectQuery,
  type ClientOption,
} from '@inspetor/hooks/use-client-query'
import { cn } from '@inspetor/lib/utils'
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

const SEARCH_PLACEHOLDER = 'Buscar cliente...'
const EMPTY_LABEL = 'Nenhum cliente encontrado.'
const TRIGGER_PLACEHOLDER = 'Selecione o cliente'

type ClientSelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
}

export function ClientSelect({
  value,
  onValueChange,
  disabled,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Cliente',
}: ClientSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useClientsForSelectQuery()
  const clients = data?.clients ?? []

  const selectedClient = clients.find((c: ClientOption) => c.id === value)

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
                  : selectedClient
                    ? selectedClient.companyName
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
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.companyName}
                      onSelect={() => {
                        onValueChange?.(value === client.id ? '' : client.id)
                        setOpen(false)
                      }}
                    >
                      {client.companyName}
                      {value === client.id && (
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
