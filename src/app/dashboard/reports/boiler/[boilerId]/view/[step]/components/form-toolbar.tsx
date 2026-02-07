'use client'

import { Button } from '@inspetor/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Save, X } from 'lucide-react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

interface FormToolbarProps {
  onBack?: () => void
  onCancel?: () => void
  onSave?: () => void
  isSaving?: boolean
  formId?: string
  showBackButton?: boolean
  isViewMode?: boolean
}

export function FormToolbar({
  onBack,
  onCancel,
  onSave,
  isSaving = false,
  formId,
  showBackButton = true,
  isViewMode = true,
}: FormToolbarProps) {
  const router = useRouter()
  const [, setAction] = useQueryState(
    'action',
    parseAsStringLiteral(['view', 'edit']).withDefault('view'),
  )

  const handleEdit = async () => {
    await setAction('edit')
    router.refresh()
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-2 rounded-2xl border bg-background p-2 shadow-lg backdrop-blur-sm">
        {showBackButton && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSaving}
            icon={ArrowLeft}
          >
            Voltar
          </Button>
        )}

        {isViewMode && (
          <Button
            type="button"
            variant="default"
            onClick={handleEdit}
            disabled={isSaving}
            icon={Pencil}
          >
            Editar
          </Button>
        )}

        {onCancel && !isViewMode && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            icon={X}
          >
            Cancelar
          </Button>
        )}

        {!isViewMode && (
          <Button
            variant="default"
            type="submit"
            form={formId}
            onClick={!formId ? onSave : undefined}
            disabled={isSaving}
            icon={Save}
          >
            Salvar
          </Button>
        )}
      </div>
    </div>
  )
}
