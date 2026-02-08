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

const SEARCH_PLACEHOLDER = 'Buscar engenheiro...'
const EMPTY_LABEL = 'Nenhum engenheiro encontrado.'
const TRIGGER_PLACEHOLDER = 'Selecione o engenheiro'

export type EngineerOption = {
  id: string
  name: string | null
  username: string | null
}

function getEngineerLabel(engineer: EngineerOption): string {
  return engineer.name ?? engineer.username ?? ''
}

type EngineerSelectProps = {
  engineers: EngineerOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
}

export function EngineerSelect({
  engineers,
  value,
  onValueChange,
  disabled,
  placeholder = TRIGGER_PLACEHOLDER,
  label = 'Engenheiro',
}: EngineerSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const selectedEngineer = engineers.find((e) => e.id === value)

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
                {selectedEngineer
                  ? getEngineerLabel(selectedEngineer)
                  : placeholder}
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
                {engineers.map((engineer) => (
                  <CommandItem
                    key={engineer.id}
                    value={getEngineerLabel(engineer)}
                    onSelect={() => {
                      onValueChange?.(value === engineer.id ? '' : engineer.id)
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
        </PopoverContent>
      </Popover>
    </div>
  )
}
