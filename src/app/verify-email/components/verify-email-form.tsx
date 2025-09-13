'use client'

import { sendVerificationEmailAction } from '@inspetor/actions/send-verification-email'
import { Button } from '@inspetor/components/ui/button'
import { Input } from '@inspetor/components/ui/input'
import { Label } from '@inspetor/components/ui/label'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

type VerifyEmailFormProps = {
  email?: string | null
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const sendEmailAction = useServerAction(sendVerificationEmailAction)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) {
      const [result, resultError] = await sendEmailAction.execute({ email })
      if (resultError) {
        toast.error(resultError.message)
        return
      }

      if (result?.success) {
        toast.success(result.message)
      } else {
        toast.error(result?.message)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email || ''}
          disabled
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        isLoading={sendEmailAction.isPending}
        disabled={email === null || email === undefined || email === ''}
        className="w-full"
        icon={Send}
        iconPosition="right"
      >
        {sendEmailAction.isPending
          ? 'Enviando...'
          : 'Enviar Email de Verificação'}
      </Button>
    </form>
  )
}
