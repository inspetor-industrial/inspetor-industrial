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
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

type ComboboxProps = {
  options: {
    value: string
    label: string
    id?: string
  }[]
  placeholder: string
  label: string
  isLoading?: boolean
  onValueChange?: (value: string) => void
  value?: string
  disabled?: boolean
}

export function Combobox({
  options,
  placeholder,
  label,
  isLoading,
  onValueChange,
  value,
  disabled,
}: ComboboxProps) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="[&>div]:first:w-full bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <p
                className={cn(
                  'truncate',
                  !value && 'text-muted-foreground',
                  isLoading && 'text-muted-foreground/80',
                )}
              >
                {value
                  ? options.find(
                      (option) => (option.id || option.value) === value,
                    )?.label
                  : placeholder}
              </p>
              <ChevronDownIcon
                size={16}
                className="text-muted-foreground/80 shrink-0 ml-auto"
                aria-hidden="true"
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2 className="size-4 animate-spin text-muted-foreground/80" />
            </div>
          ) : (
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>Nenhum {label} encontrado.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id || option.value}
                      value={option.id || option.value}
                      onSelect={(currentValue) => {
                        onValueChange?.(
                          currentValue === value ? '' : currentValue,
                        )
                        setOpen(false)
                      }}
                    >
                      {option.label}
                      {value === (option.id || option.value) && (
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
