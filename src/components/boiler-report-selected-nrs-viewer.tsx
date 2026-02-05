'use client'

import type { InjectorGaugeNrItem } from '@inspetor/constants/nrs-injector'

export type BoilerReportSelectedNrsViewerProps = {
  items: InjectorGaugeNrItem[]
  title?: string
}

function hasSelection(nr: InjectorGaugeNrItem): boolean {
  return (
    nr.parentSelected || nr.children.some((c) => c.selected)
  )
}

export function BoilerReportSelectedNrsViewer({
  items,
  title = "NR's selecionadas",
}: BoilerReportSelectedNrsViewerProps) {
  const selectedItems = items.filter(hasSelection)

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-muted/20 shadow-sm">
      <div className="border-b bg-muted/40 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {selectedItems.map((nr, idx) => (
          <div key={`selected-nr-${idx}`} className="px-4 py-3">
            <p className="text-sm font-medium leading-snug text-foreground">
              {nr.parent}
            </p>
            {nr.children.filter((c) => c.selected).length > 0 && (
              <ul className="mt-2 border-l-2 border-border pl-3">
                {nr.children
                  .filter((c) => c.selected)
                  .map((c, cIdx) => (
                    <li
                      key={`selected-nr-${idx}-child-${cIdx}`}
                      className="py-1 text-sm leading-snug text-muted-foreground"
                    >
                      {c.text}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
