'use client'

import { sendVerificationEmailAction } from '@inspetor/actions/send-verification-email'
import { Button } from '@inspetor/components/ui/button'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

type SendEmailVerificationButtonProps = {
  email?: string | null
}

export function SendEmailVerificationButton({
  email,
}: SendEmailVerificationButtonProps) {
  const action = useServerAction(sendVerificationEmailAction)

  async function handleSendVerificationEmail() {
    const [result, resultError] = await action.execute({ email })

    if (resultError) {
      toast.error(resultError.message)
      return
    }

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result?.message)
    }
  }

  return (
    <Button
      disabled={!email}
      onClick={handleSendVerificationEmail}
      isLoading={action.isPending}
      icon={Send}
      iconPosition="right"
    >
      Enviar e-mail de verificação
    </Button>
  )
}
