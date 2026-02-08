import { zodResolver } from '@hookform/resolvers/zod'
import { createUserAction } from '@inspetor/actions/create-user'
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
  DialogTrigger,
} from '@inspetor/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { Password } from '@inspetor/components/ui/password'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getUsersQueryKey } from '@inspetor/hooks/use-users-query'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z
  .object({
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
    password: z.string({
      message: 'Senha é obrigatória',
    }),
    role: z.string(),
    confirmPassword: z.string({
      message: 'Confirmação de senha é obrigatória',
    }),
    companyId: z.string({
      message: 'Empresa é obrigatória',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type Schema = z.infer<typeof schema>

export function UserCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createUserAction)
  const queryClient = useQueryClient()

  const isMobile = useIsMobile()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleCreateUser(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      toast.error('Erro ao criar usuário')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })
    } else {
      toast.error(result?.message)
    }

    form.reset({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyId: '',
      role: '',
    })

    form.setValue('name', '')
    form.setValue('username', '')
    form.setValue('email', '')
    form.setValue('password', '')
    form.setValue('confirmPassword', '')
    form.setValue('companyId', '')
    form.setValue('role', '')

    setIsModalOpen(false)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="company-creation-form"
        onSubmit={form.handleSubmit(handleCreateUser)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g pedro augusto" />
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
                <Input {...field} placeholder="e.g pedroaba@gmail.com" />
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
                  <SelectTrigger>
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Password {...field} placeholder="e.g 123456" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Password {...field} placeholder="e.g 123456" />
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
        <DrawerTrigger asChild>
          <Button icon={IconPlus}>Novo usuário</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cadastrar usuário</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para cadastrar um novo usuário.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button type="submit" form="company-creation-form">
              Cadastrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Novo usuário</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo usuário.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="company-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
