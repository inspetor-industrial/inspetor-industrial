'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@inspetor/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Input } from '@inspetor/components/ui/input'
import { useAuth } from '@inspetor/lib/auth/context'
import { Lock, LogIn, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  email: z.string(),
  password: z
    .string({
      message: 'Por favor, digite sua senha',
    })
    .min(1, {
      message: 'A senha é obrigatória',
    }),
})

type Schema = z.infer<typeof schema>

export function SignInForm() {
  const { login } = useAuth()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleSignIn() {
    try {
      const { email, password } = form.getValues()
      await login({ email, password })
      toast.success('Acesso autorizado! Redirecionando...')
    } catch {
      toast.error('Acesso negado', {
        description:
          'Credenciais incorretas. Verifique seus dados e tente novamente.',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        id="sign-in"
        className="space-y-6"
        onSubmit={form.handleSubmit(handleSignIn)}
      >
        <FormField
          control={form.control}
          name="email"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-white font-medium">
                <Mail className="h-4 w-4" />
                E-mail ou Nome de usuário
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite seu e-mail corporativo"
                  className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-white font-medium">
                <Lock className="h-4 w-4" />
                Senha
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Digite sua senha"
                  className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full bg-inspetor-dark-blue-700 hover:bg-inspetor-dark-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
          icon={LogIn}
        >
          {form.formState.isSubmitting ? 'Acessando...' : 'Acessar Sistema'}
        </Button>
      </form>
    </Form>
  )
}
