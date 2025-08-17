'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Button } from '@inspetor/components/ui/button'
import { cn } from '@inspetor/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useQueryState } from 'nuqs'

type GoBackButtonProps = {
  parentFolderId: string
}

export function GoBackButton({ parentFolderId }: GoBackButtonProps) {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folderId', {
    defaultValue: '',
  })

  const router = useRouter()

  async function handleGoBack() {
    setSelectedFolderId(parentFolderId)

    try {
      await invalidatePageCache('/dashboard/storage/reports')
    } finally {
      router.refresh()
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGoBack}
      className={cn(
        'w-fit',
        (selectedFolderId === '' || !selectedFolderId) && 'hidden',
      )}
    >
      <ArrowLeft className="size-4" />
      Voltar para pasta raiz
    </Button>
  )
}
