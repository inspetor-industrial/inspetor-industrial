'use client'

import { Button } from '@inspetor/components/ui/button'
import { Checkbox } from '@inspetor/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@inspetor/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@inspetor/components/ui/dialog'
import { Separator } from '@inspetor/components/ui/separator'
import type { InjectorGaugeNrItem } from '@inspetor/constants/nrs-injector'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export type BoilerReportNrSelectorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: InjectorGaugeNrItem[]
  onConfirm: (value: InjectorGaugeNrItem[]) => void
  disabled?: boolean
}

export function BoilerReportNrSelectorModal({
  open,
  onOpenChange,
  value,
  onConfirm,
  disabled = false,
}: BoilerReportNrSelectorModalProps) {
  const [localNrs, setLocalNrs] = useState<InjectorGaugeNrItem[]>(value)
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalNrs(
        value.map((nr) => ({
          parent: nr.parent,
          parentSelected: nr.parentSelected,
          children: nr.children.map((c) => ({
            selected: c.selected,
            text: c.text,
          })),
        })),
      )
    }
  }, [open, value])

  const setParentSelected = useCallback((index: number, checked: boolean) => {
    setLocalNrs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], parentSelected: checked }
      return next
    })
  }, [])

  const setParentAndChildrenSelected = useCallback(
    (index: number, parentChecked: boolean) => {
      setLocalNrs((prev) => {
        const next = [...prev]
        const nr = next[index]
        next[index] = {
          ...nr,
          parentSelected: parentChecked,
          children: nr.children.map((c) => ({
            ...c,
            selected: parentChecked,
          })),
        }
        return next
      })
    },
    [],
  )

  const setChildSelected = useCallback(
    (nrIndex: number, childIndex: number, checked: boolean) => {
      setLocalNrs((prev) => {
        const next = [...prev]
        const nextChildren = [...next[nrIndex].children]
        nextChildren[childIndex] = {
          ...nextChildren[childIndex],
          selected: checked,
        }
        next[nrIndex] = { ...next[nrIndex], children: nextChildren }
        return next
      })
    },
    [],
  )

  const handleConfirm = useCallback(() => {
    onConfirm(localNrs)
    onOpenChange(false)
  }, [localNrs, onConfirm, onOpenChange])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setLocalNrs(value)
        setExpandedIndices(new Set())
      }
      onOpenChange(next)
    },
    [value, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden"
        aria-describedby="nr-selector-description"
      >
        <DialogHeader>
          <DialogTitle>Selecionar NR&apos;s</DialogTitle>
          <DialogDescription id="nr-selector-description">
            Selecione as normas regulamentadoras aplicáveis ao exame.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/30 py-2">
          {localNrs.map((nr, nrIndex) => {
            const hasChildren = nr.children.length > 0
            const isExpanded = expandedIndices.has(nrIndex)
            const allChildrenSelected =
              hasChildren && nr.children.every((c) => c.selected)
            const someChildrenSelected = nr.children.some((c) => c.selected)
            const isParentIndeterminate =
              hasChildren && someChildrenSelected && !allChildrenSelected
            const isParentChecked = hasChildren
              ? nr.parentSelected && allChildrenSelected
              : nr.parentSelected
            const parentCheckState: boolean | 'indeterminate' =
              isParentIndeterminate ? 'indeterminate' : isParentChecked
            return (
              <div key={`nr-${nrIndex}`}>
                <div className="px-3">
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={(open) => {
                      if (open) {
                        setExpandedIndices((prev) => new Set(prev).add(nrIndex))
                      } else {
                        setExpandedIndices((prev) => {
                          const next = new Set(prev)
                          next.delete(nrIndex)
                          return next
                        })
                      }
                    }}
                  >
                    <div className="flex items-start gap-2 py-1.5">
                      {hasChildren ? (
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="flex shrink-0 cursor-pointer items-center justify-center p-0.5 text-muted-foreground hover:text-foreground"
                            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      ) : (
                        <span className="w-5 shrink-0" aria-hidden />
                      )}
                      <Checkbox
                        id={`nr-parent-${nrIndex}`}
                        checked={
                          hasChildren ? parentCheckState : nr.parentSelected
                        }
                        onCheckedChange={(checked) => {
                          if (hasChildren) {
                            setParentAndChildrenSelected(
                              nrIndex,
                              checked === true,
                            )
                          } else {
                            setParentSelected(nrIndex, checked === true)
                          }
                        }}
                        disabled={disabled}
                        aria-label={`Selecionar NR: ${nr.parent.slice(0, 50)}...`}
                        className="mt-0.5 shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor={`nr-parent-${nrIndex}`}
                        className="min-w-0 flex-1 cursor-pointer text-left text-sm font-medium leading-snug hover:underline"
                      >
                        {nr.parent}
                      </label>
                    </div>
                    <CollapsibleContent>
                      <ul className="ml-5 mt-1 space-y-1 border-l-2 border-border pl-2.5">
                        {nr.children.map((child, childIndex) => (
                          <li
                            key={`nr-${nrIndex}-child-${childIndex}`}
                            className="flex items-start gap-2 py-1"
                          >
                            <Checkbox
                              id={`nr-child-${nrIndex}-${childIndex}`}
                              checked={child.selected}
                              onCheckedChange={(checked) => {
                                setChildSelected(
                                  nrIndex,
                                  childIndex,
                                  checked === true,
                                )
                              }}
                              disabled={disabled}
                              aria-label={child.text.slice(0, 80)}
                              className="mt-0.5 shrink-0 cursor-pointer"
                            />
                            <label
                              htmlFor={`nr-child-${nrIndex}-${childIndex}`}
                              className="cursor-pointer text-sm text-foreground"
                            >
                              {child.text}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                {nrIndex < localNrs.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Fechar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={disabled}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
