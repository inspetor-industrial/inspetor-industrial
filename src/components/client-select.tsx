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
import { cn } from '@inspetor/lib/utils'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useId, useState } from 'react'

const SEARCH_PLACEHOLDER = 'Buscar cliente...'
const EMPTY_LABEL = 'Nenhum cliente encontrado.'
const TRIGGER_PLACEHOLDER = 'Selecione o cliente'

export type ClientOption = {
  id: string
  companyName: string
}

type ClientSelectProps = {
  clients: ClientOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
}

export function ClientSelect({
  clients,
  value,
  onValueChange,
  disabled,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Cliente',
}: ClientSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const selectedClient = clients.find((c) => c.id === value)

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
            disabled={disabled}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <p
                className={cn(
                  'truncate',
                  !value && 'text-muted-foreground',
                )}
              >
                {selectedClient ? selectedClient.companyName : placeholder}
              </p>
              <ChevronDownIcon
                size={16}
                className="ml-auto shrink-0 text-muted-foreground/80"
                aria-hidden
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-(--radix-popper-anchor-width) p-0"
          align="start"
        >
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
        </PopoverContent>
      </Popover>
    </div>
  )
}
