import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserAction } from '@inspetor/actions/update-user'
import { CompanySelect } from '@inspetor/components/company-select'
import { Button } from '@inspetor/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@inspetor/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@inspetor/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Input } from '@inspetor/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import {
  getUsersQueryKey,
  type UserListItem,
} from '@inspetor/hooks/use-users-query'
import { useAuth, useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string({
    message: 'Nome é obrigatório',
  }),
  username: z.string({
    message: 'Username é obrigatório',
  }),
  email: z
    .string({
      message: 'Email é obrigatório',
    })
    .optional(),
  companyId: z.string({
    message: 'Empresa é obrigatória',
  }),
  role: z.string({
    message: 'Permissão é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

type UserEditModalProps = {
  ref?: RefObject<any>
}

export function UserEditModal({ ref }: UserEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateUserAction)

  const session = useSession()
  const { logout } = useAuth()

  const [userId, setUserId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      companyId: '',
      role: '',
    },
  })

  const queryClient = useQueryClient()
  const router = useRouter()

  const isMobile = useIsMobile()

  async function handleUpdateUser(data: Schema) {
    const [result, resultError] = await action.execute({
      userId: userId ?? '',
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar usuário')
      return
    }

    if (result?.success) {
      toast.success(result.message)

      if (
        session.data?.user.email === data.email &&
        session.data?.user.role !== data.role
      ) {
        await logout()
        router.push('/auth/sign-in')
      } else {
        await queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })
      }
    } else {
      toast.error(result?.message)
    }

    form.reset({
      name: '',
      email: '',
      companyId: '',
      role: '',
    })

    form.setValue('name', '')
    form.setValue('username', '')
    form.setValue('email', '')
    form.setValue('companyId', '')
    form.setValue('role', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (user: UserListItem, isOnlyRead = false) => {
      setIsOnlyRead(isOnlyRead)
      setUserId(user.id)
      setIsModalOpen(true)
      form.reset({
        name: user.name ?? '',
        username: user.username ?? '',
        email: user.email,
        companyId: user.companyId ?? '',
        role: user.role,
      })

      form.setValue('name', user.name ?? '')
      form.setValue('username', user.username ?? '')
      form.setValue('email', user.email)
      form.setValue('companyId', user.companyId ?? '')
      form.setValue('role', user.role.toLowerCase())
    },
    close: () => setIsModalOpen(false),
  }))

  const FormComponent = (
    <Form {...form}>
      <form
        id="user-creation-form"
        onSubmit={form.handleSubmit(handleUpdateUser)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g pedro augusto"
                  disabled={isOnlyRead}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g pedroaba" />
              </FormControl>
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
                  {...field}
                  placeholder="e.g pedroaba@gmail.com"
                  disabled={isOnlyRead}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <CompanySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione uma empresa"
                  label="Empresa"
                  disabled={isOnlyRead || form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissão</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger disabled={isOnlyRead}>
                    <SelectValue placeholder="Selecione uma permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar usuário</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para editar o usuário.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>
            <Button type="submit" form="user-creation-form">
              Editar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o usuário.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="user-creation-form"
              isLoading={form.formState.isSubmitting}
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
