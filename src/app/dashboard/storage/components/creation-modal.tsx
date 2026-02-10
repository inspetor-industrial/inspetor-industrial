'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { registerStorageAction } from '@inspetor/actions/register-storage'
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
import { Label } from '@inspetor/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@inspetor/components/ui/radio-group'
import { useCompanyUnitsQuery } from '@inspetor/hooks/use-company-units-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getStoragesQueryKey } from '@inspetor/hooks/use-storages-query'
import { useSession } from '@inspetor/lib/auth/context'
import { IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z
  .object({
    companyId: z.string().optional(),
    relativeLink: z.string({
      message: 'Link para a pasta é obrigatório',
    }),
    unitScope: z.enum(['all', 'restricted']),
    unitIds: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.unitScope === 'restricted') {
        return data.unitIds.length >= 1
      }
      return data.unitIds.length === 0
    },
    {
      message:
        'Escopo restrito exige ao menos uma unidade; escopo "todas" exige nenhuma unidade selecionada.',
      path: ['unitIds'],
    },
  )

type Schema = z.infer<typeof schema>

export function StorageCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isMobile = useIsMobile()

  const session = useSession()
  const isAdmin = session.data?.user?.role === 'ADMIN'

  const action = useServerAction(registerStorageAction)
  const queryClient = useQueryClient()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      relativeLink: '',
      unitScope: 'all',
      unitIds: [],
    },
  })

  const companyIdFromForm = useWatch({ control: form.control, name: 'companyId' })
  const unitScope = useWatch({ control: form.control, name: 'unitScope' })
  const effectiveCompanyId =
    isAdmin && companyIdFromForm
      ? companyIdFromForm
      : (session.data?.user?.companyId ?? '')

  const { data: unitsData } = useCompanyUnitsQuery(
    effectiveCompanyId || null,
    1,
  )
  const hasNoUnits = Boolean(
    effectiveCompanyId && (unitsData?.totalPages ?? 0) === 0,
  )

  useEffect(() => {
    if (!companyIdFromForm) return
    form.setValue('unitScope', 'all')
    form.setValue('unitIds', [])
  }, [companyIdFromForm, form])

  async function handleRegisterStorage(data: Schema) {
    const resolvedUnitIds =
      data.unitScope === 'all' ? [] : (data.unitIds ?? [])
    const payload =
      isAdmin && data.companyId
        ? { ...data, unitScope: data.unitScope, unitIds: resolvedUnitIds }
        : {
            ...data,
            companyId: undefined,
            unitScope: data.unitScope,
            unitIds: resolvedUnitIds,
          }
    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao registrar pasta')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getStoragesQueryKey() })
    } else {
      toast.error(result?.message)
    }

    form.reset({
      companyId: '',
      relativeLink: '',
      unitScope: 'all',
      unitIds: [],
    })
    form.setValue('companyId', '')
    form.setValue('relativeLink', '')
    form.setValue('unitScope', 'all')
    form.setValue('unitIds', [])

    setIsModalOpen(false)
  }

  const formBody = (
    <Form {...form}>
      <form
        id="storage-creation-form"
        onSubmit={form.handleSubmit(handleRegisterStorage)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-4"
      >
        {isAdmin && (
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <CompanySelect
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder="Selecione uma empresa"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {isAdmin && effectiveCompanyId ? (
          <div className="md:col-span-2 rounded-md border p-3 space-y-3">
            <FormField
              control={form.control}
              name="unitScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escopo das unidades</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === 'all') form.setValue('unitIds', [])
                      }}
                      className="flex flex-col gap-2"
                      disabled={hasNoUnits}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="all"
                          id="storage-unit-scope-all"
                          aria-label="Todas as unidades"
                        />
                        <Label
                          htmlFor="storage-unit-scope-all"
                          className="font-normal cursor-pointer"
                        >
                          Todas as unidades
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="restricted"
                          id="storage-unit-scope-restricted"
                          aria-label="Unidades específicas"
                        />
                        <Label
                          htmlFor="storage-unit-scope-restricted"
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

            {unitScope === 'restricted' && (
              <>
                {hasNoUnits ? (
                  <div className="rounded-md border border-dashed p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma unidade cadastrada para esta empresa.
                    </p>
                    <Button type="button" variant="link" asChild>
                      <Link
                        href={
                          effectiveCompanyId
                            ? `/dashboard/company/${effectiveCompanyId}/units`
                            : '/dashboard/company'
                        }
                      >
                        Gerenciar unidades
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="unitIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidades permitidas</FormLabel>
                        <FormControl>
                          <UnitMultiSelect
                            companyId={effectiveCompanyId}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione as unidades"
                            label="Unidades"
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
              {unitScope === 'all'
                ? 'Todas as unidades'
                : 'Restrito'}
              {unitScope === 'restricted' &&
                ` — ${form.watch('unitIds').length} selecionada(s)`}
            </p>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="relativeLink"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Link para a pasta</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g https://drive.google.com/drive/folders/pedroaba-tech"
                />
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
          <Button type="button" className="w-full md:w-auto" icon={IconPlus}>
            Registrar pasta
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Registrar pasta</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para registrar uma nova pasta.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{formBody}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>

            <Button
              type="submit"
              form="storage-creation-form"
              isLoading={form.formState.isSubmitting}
            >
              Registrar pasta
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full md:w-auto" icon={IconPlus}>
          Registrar pasta
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pasta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar uma nova pasta.
          </DialogDescription>
        </DialogHeader>

        {formBody}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="storage-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Registrar pasta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
