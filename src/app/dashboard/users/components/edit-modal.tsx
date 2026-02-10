'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserAction } from '@inspetor/actions/update-user'
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
import { Label } from '@inspetor/components/ui/label'
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
import {
  useCompaniesForSelectQuery,
} from '@inspetor/hooks/use-companies-query'
import { useCompanyUnitsQuery } from '@inspetor/hooks/use-company-units-query'
import {
  getUserUnitAccessQueryKey,
  useUserUnitAccessQuery,
} from '@inspetor/hooks/use-user-unit-access-query'
import { useSetUserUnitAccessMutation } from '@inspetor/hooks/use-set-user-unit-access-mutation'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import {
  getUsersQueryKey,
  type UserListItem,
} from '@inspetor/hooks/use-users-query'
import { useAuth, useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { type RefObject, useImperativeHandle, useEffect, useRef, useState } from 'react'
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
    companyId: z.string({
      message: 'Empresa é obrigatória',
    }),
    role: z.string({
      message: 'Permissão é obrigatória',
    }),
    access: accessSchema,
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

type UserEditModalProps = {
  ref?: RefObject<{ open: (user: UserListItem, isOnlyRead?: boolean) => void; close: () => void } | null>
}

export function UserEditModal({ ref: refProp }: UserEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const updateUserActionHook = useServerAction(updateUserAction)
  const setAccessMutation = useSetUserUnitAccessMutation()

  const session = useSession()
  const { logout } = useAuth()

  const [userId, setUserId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)
  const accessSyncedRef = useRef(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      companyId: '',
      role: '',
      access: defaultAccess,
    },
  })

  const companyId = useWatch({ control: form.control, name: 'companyId' })
  const accessScope = useWatch({ control: form.control, name: 'access.scope' })
  const allowedUnitIds = useWatch({
    control: form.control,
    name: 'access.allowedUnitIds',
  })
  const prevCompanyIdRef = useRef<string | null>(null)

  const queryClient = useQueryClient()
  const router = useRouter()
  const isMobile = useIsMobile()

  const { data: accessData } = useUserUnitAccessQuery(
    userId,
    companyId && isModalOpen ? companyId : null,
  )

  useEffect(() => {
    if (!companyId || !isModalOpen) return
    const prev = prevCompanyIdRef.current
    prevCompanyIdRef.current = companyId
    if (prev != null && prev !== companyId) {
      form.setValue('access', defaultAccess)
      accessSyncedRef.current = false
    }
  }, [companyId, isModalOpen, form])

  useEffect(() => {
    if (
      isModalOpen &&
      userId &&
      companyId &&
      accessData &&
      !accessSyncedRef.current
    ) {
      form.setValue('access', {
        scope: accessData.scope,
        allowedUnitIds: accessData.allowedUnitIds,
        defaultUnitId: accessData.defaultUnitId ?? null,
      })
      accessSyncedRef.current = true
    }
  }, [isModalOpen, userId, companyId, accessData, form])

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

  async function handleUpdateUser(data: Schema) {
    const [result, resultError] = await updateUserActionHook.execute({
      userId: userId ?? '',
      name: data.name,
      username: data.username,
      email: data.email ?? '',
      companyId: data.companyId,
      role: data.role,
    })

    if (resultError) {
      toast.error('Erro ao editar usuário')
      return
    }

    if (!result?.success) {
      toast.error(result?.message)
      return
    }

    if (
      session.data?.user.email === data.email &&
      session.data?.user.role !== data.role
    ) {
      await logout()
      router.push('/auth/sign-in')
      return
    }

    const accessRaw = await setAccessMutation.mutateAsync({
      userId: userId ?? '',
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

    toast.success(result.message)
    await queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })

    form.reset({
      name: '',
      username: '',
      email: '',
      companyId: '',
      role: '',
      access: defaultAccess,
    })
    setIsModalOpen(false)
  }

  useImperativeHandle(refProp, () => ({
    open: (user: UserListItem, isOnlyReadModal = false) => {
      setIsOnlyRead(isOnlyReadModal)
      setUserId(user.id)
      accessSyncedRef.current = false
      prevCompanyIdRef.current = null
      setIsModalOpen(true)
      form.reset({
        name: user.name ?? '',
        username: user.username ?? '',
        email: user.email,
        companyId: user.companyId ?? '',
        role: user.role.toLowerCase(),
        access: defaultAccess,
      })
      void queryClient.removeQueries({
        queryKey: getUserUnitAccessQueryKey(
          user.id,
          user.companyId ?? '',
        ),
      })
    },
    close: () => {
      setIsModalOpen(false)
      prevCompanyIdRef.current = null
    },
  }))

  const canUpdateUser = !isOnlyRead
  const accessTabDisabled = !companyId

  const FormComponent = (
    <Form {...form}>
      <form
        id="user-creation-form"
        onSubmit={form.handleSubmit(handleUpdateUser)}
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
                    <Input
                      {...field}
                      placeholder="e.g pedroaba"
                      disabled={isOnlyRead}
                    />
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
                        disabled={isOnlyRead || hasNoUnits}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="all"
                            id="access-scope-all"
                            aria-label="Todas as unidades"
                          />
                          <Label
                            htmlFor="access-scope-all"
                            className="font-normal cursor-pointer"
                          >
                            Todas as unidades
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="restricted"
                            id="access-scope-restricted"
                            aria-label="Unidades específicas"
                          />
                          <Label
                            htmlFor="access-scope-restricted"
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

              {accessScope === 'restricted' && (
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
                              disabled={isOnlyRead}
                              readOnly={isOnlyRead}
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
                {accessScope === 'all'
                  ? 'Todas as unidades'
                  : 'Restrito'}
                {accessScope === 'restricted' &&
                  ` — ${allowedUnitIds?.length ?? 0} selecionada(s)`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )

  const isSubmitting =
    form.formState.isSubmitting || setAccessMutation.isPending

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
              <Button type="button" variant="outline">
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>
            {canUpdateUser && (
              <Button
                type="submit"
                form="user-creation-form"
                isLoading={isSubmitting}
              >
                Editar
              </Button>
            )}
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
            <Button type="button" variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {canUpdateUser && (
            <Button
              type="submit"
              form="user-creation-form"
              isLoading={isSubmitting}
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
