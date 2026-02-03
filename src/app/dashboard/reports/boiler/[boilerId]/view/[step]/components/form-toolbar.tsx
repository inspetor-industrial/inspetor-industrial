'use client'

import { Button } from '@inspetor/components/ui/button'
import { ArrowLeft, Save, X } from 'lucide-react'

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
  return (
    <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+1.8rem)] -translate-x-1/2 z-50">
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
