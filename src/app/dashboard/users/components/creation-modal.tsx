import { zodResolver } from '@hookform/resolvers/zod'
import { createUserAction } from '@inspetor/actions/create-user'
import { CompanySelect } from '@inspetor/components/company-select'
import { UnitMultiSelect } from '@inspetor/components/unit-multi-select'
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
  RadioGroup,
  RadioGroupItem,
} from '@inspetor/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@inspetor/components/ui/tabs'
import { Label } from '@inspetor/components/ui/label'
import {
  useCompaniesForSelectQuery,
} from '@inspetor/hooks/use-companies-query'
import { useCompanyUnitsQuery } from '@inspetor/hooks/use-company-units-query'
import { useSetUserUnitAccessMutation } from '@inspetor/hooks/use-set-user-unit-access-mutation'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getUsersQueryKey } from '@inspetor/hooks/use-users-query'
import { IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const accessSchema = z.object({
  scope: z.enum(['all', 'restricted']),
  allowedUnitIds: z.array(z.string()),
  defaultUnitId: z.string().nullable().optional(),
})

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
    access: accessSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.access.scope === 'restricted') {
        return data.access.allowedUnitIds.length >= 1
      }
      return data.access.allowedUnitIds.length === 0
    },
    {
      message:
        'Escopo restrito exige ao menos uma unidade; escopo "todas" exige nenhuma unidade selecionada.',
      path: ['access', 'allowedUnitIds'],
    },
  )

type Schema = z.infer<typeof schema>

const defaultAccess = {
  scope: 'all' as const,
  allowedUnitIds: [] as string[],
  defaultUnitId: null as string | null,
}

export function UserCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createUserAction)
  const setAccessMutation = useSetUserUnitAccessMutation()
  const queryClient = useQueryClient()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyId: '',
      role: '',
      access: defaultAccess,
    },
  })

  const isMobile = useIsMobile()
  const companyId = useWatch({ control: form.control, name: 'companyId' })

  useEffect(() => {
    if (!companyId) return
    form.setValue('access', defaultAccess)
  }, [companyId, form])

  const { data: companiesData } = useCompaniesForSelectQuery()
  const companies = companiesData?.companies ?? []
  const selectedCompanyName =
    companyId && companies.length > 0
      ? companies.find((c) => c.id === companyId)?.name ?? null
      : null

  const { data: unitsData } = useCompanyUnitsQuery(companyId || null, 1)
  const hasNoUnits = Boolean(
    companyId && (unitsData?.totalPages ?? 0) === 0,
  )
  const accessTabDisabled = !companyId

  async function handleCreateUser(data: Schema) {
    const [result, resultError] = await action.execute({
      name: data.name,
      username: data.username,
      email: data.email ?? '',
      password: data.password,
      companyId: data.companyId,
      role: data.role,
    })

    if (resultError) {
      toast.error('Erro ao criar usuário')
      return
    }

    if (!result?.success) {
      toast.error(result?.message)
      return
    }

    const newUserId = result?.others?.userId as string | undefined
    if (newUserId) {
      const accessRaw = await setAccessMutation.mutateAsync({
        userId: newUserId,
        companyId: data.companyId,
        scope: data.access.scope,
        allowedUnitIds: data.access.allowedUnitIds,
        defaultUnitId: data.access.defaultUnitId ?? null,
      }).catch(() => null)
      if (accessRaw === null) {
        toast.error('Falha ao salvar acesso por unidade.')
      } else if (Array.isArray(accessRaw)) {
        const [accessData, accessError] = accessRaw
        if (accessError) {
          toast.error(
            (accessError as { message?: string }).message ??
              'Falha ao salvar acesso por unidade.',
          )
        } else if (accessData && !accessData.success) {
          toast.error(
            accessData.message ?? 'Falha ao salvar acesso por unidade.',
          )
        }
      }
    }

    toast.success(result.message)
    await queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })

    form.reset({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyId: '',
      role: '',
      access: defaultAccess,
    })
    setIsModalOpen(false)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="company-creation-form"
        onSubmit={form.handleSubmit(handleCreateUser)}
        className="space-y-4"
      >
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="acessos" disabled={accessTabDisabled}>
              Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
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
          </TabsContent>

          <TabsContent value="acessos" className="space-y-4 mt-4">
            <div className="rounded-md border p-3 space-y-3">
              <p className="text-sm font-medium">Empresa</p>
              <p className="text-sm text-muted-foreground">
                {selectedCompanyName ?? '—'}
              </p>

              <FormField
                control={form.control}
                name="access.scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escopo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col gap-2"
                        disabled={hasNoUnits}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="all"
                            id="create-access-scope-all"
                            aria-label="Todas as unidades"
                          />
                          <Label
                            htmlFor="create-access-scope-all"
                            className="font-normal cursor-pointer"
                          >
                            Todas as unidades
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="restricted"
                            id="create-access-scope-restricted"
                            aria-label="Unidades específicas"
                          />
                          <Label
                            htmlFor="create-access-scope-restricted"
                            className="font-normal cursor-pointer"
                          >
                            Unidades específicas
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('access.scope') === 'restricted' && (
                <>
                  {hasNoUnits ? (
                    <div className="rounded-md border border-dashed p-4 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Nenhuma unidade cadastrada para esta empresa.
                      </p>
                      <Button type="button" variant="link" asChild>
                        <Link
                          href={
                            companyId
                              ? `/dashboard/company/${companyId}/units`
                              : '/dashboard/company'
                          }
                        >
                          Gerenciar unidades
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Controller
                      control={form.control}
                      name="access.allowedUnitIds"
                      render={({ field: allowedField }) => (
                        <FormItem>
                          <FormLabel>Unidades permitidas</FormLabel>
                          <FormControl>
                            <UnitMultiSelect
                              companyId={companyId ?? ''}
                              value={allowedField.value}
                              onChange={allowedField.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              <p className="text-xs text-muted-foreground">
                Escopo:{' '}
                {form.watch('access.scope') === 'all'
                  ? 'Todas as unidades'
                  : 'Restrito'}
                {form.watch('access.scope') === 'restricted' &&
                  ` — ${form.watch('access.allowedUnitIds').length} selecionada(s)`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
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
            <Button
              type="submit"
              form="company-creation-form"
              disabled={form.formState.isSubmitting || setAccessMutation.isPending}
            >
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
            isLoading={
              form.formState.isSubmitting || setAccessMutation.isPending
            }
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
