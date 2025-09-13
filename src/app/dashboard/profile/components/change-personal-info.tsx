'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileAction } from '@inspetor/actions/update-profile'
import { Button } from '@inspetor/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Input } from '@inspetor/components/ui/input'
import type { User } from '@prisma/client'
import { Save } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

type ChangePersonalInfoProps = {
  user: User
}

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  email: z.email('Email inválido'),
})

type Schema = z.infer<typeof schema>

export function ChangePersonalInfo(props: ChangePersonalInfoProps) {
  const { execute } = useServerAction(updateProfileAction)
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: props.user.name || '',
      username: props.user.username || '',
      email: props.user.email,
    },
  })

  async function handleChangePersonalInfo(data: Schema) {
    const [result, resultError] = await execute({
      userId: props.user.id,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao atualizar perfil')
    }

    if (result?.success) {
      toast.success('Perfil atualizado com sucesso', {
        description:
          'Você será redirecionado para a página de login, para fazer login com o novo nome de usuário',
      })

      await signOut({
        redirectTo: '/auth/sign-in',
      })
    } else {
      toast.error(result?.message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleChangePersonalInfo)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="e.g Pedro Augusto" {...field} />
              </FormControl>
              <FormDescription>
                Use seu nome completo ou um nome de exibição com o qual você se
                sinta confortável
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <Input placeholder="e.g pedroaba" {...field} />
              </FormControl>
              <FormDescription>
                Use seu nome de usuário para fazer login na sua conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g pedroaba@gmail.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use seu endereço de email para receber notificações e
                atualizações da sua conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            icon={Save}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}
