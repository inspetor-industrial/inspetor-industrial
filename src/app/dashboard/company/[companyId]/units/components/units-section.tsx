'use client'

import { useAbility } from '@inspetor/casl/context'
import { subject } from '@casl/ability'
import type { Subjects } from '@inspetor/casl/ability'
import { Button } from '@inspetor/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'

import { UnitCreationModal } from './creation-modal'
import { UnitsTable } from './units-table'

type UnitsSectionProps = {
  companyId: string
  companyName: string
}

export function UnitsSection({ companyId }: UnitsSectionProps) {
  const [creationOpen, setCreationOpen] = useState(false)
  const ability = useAbility()
  const subjectCompanyUnit = subject('CompanyUnit', {
    companyId,
  }) as unknown as Subjects
  const canCreate = ability.can('create', subjectCompanyUnit)

  return (
    <div className="flex flex-col gap-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button
            type="button"
            icon={IconPlus}
            onClick={() => setCreationOpen(true)}
          >
            Nova unidade
          </Button>
        </div>
      )}
      <UnitsTable companyId={companyId} />
      <UnitCreationModal
        companyId={companyId}
        open={creationOpen}
        onOpenChange={setCreationOpen}
      />
    </div>
  )
}
