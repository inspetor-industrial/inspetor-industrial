'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateStorageAction } from '@inspetor/actions/update-storage'
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
import type { StorageListItem } from '@inspetor/hooks/use-storages-query'
import { useCompanyUnitsQuery } from '@inspetor/hooks/use-company-units-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getStoragesQueryKey } from '@inspetor/hooks/use-storages-query'
import { useSession } from '@inspetor/lib/auth/context'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import {
  type RefObject,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from 'react'
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

type StorageEditModalProps = {
  ref?: RefObject<{ open: (storage: StorageListItem, isOnlyRead?: boolean) => void; close: () => void } | null>
}

export function StorageEditModal({ ref }: StorageEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isMobile = useIsMobile()

  const session = useSession()
  const isAdmin = session.data?.user?.role === 'ADMIN'

  const action = useServerAction(updateStorageAction)
  const queryClient = useQueryClient()

  const [storageId, setStorageId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)
  const isInitializingFromStorageRef = useRef(false)

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
  const effectiveCompanyId = companyIdFromForm ?? ''

  const { data: unitsData } = useCompanyUnitsQuery(
    effectiveCompanyId || null,
    1,
  )
  const hasNoUnits = Boolean(
    effectiveCompanyId && (unitsData?.totalPages ?? 0) === 0,
  )

  useEffect(() => {
    if (!companyIdFromForm) return
    if (isInitializingFromStorageRef.current) return
    form.setValue('unitScope', 'all')
    form.setValue('unitIds', [])
  }, [companyIdFromForm, form])

  async function handleUpdateStorage(data: Schema) {
    if (!storageId) return
    const resolvedUnitIds =
      data.unitScope === 'all' ? [] : (data.unitIds ?? [])
    const payload =
      isAdmin && data.companyId !== undefined
        ? {
            storageId,
            relativeLink: data.relativeLink,
            companyId: data.companyId,
            unitScope: data.unitScope,
            unitIds: resolvedUnitIds,
          }
        : {
            storageId,
            relativeLink: data.relativeLink,
            companyId: undefined,
            unitScope: data.unitScope,
            unitIds: resolvedUnitIds,
          }
    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao editar pasta')
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

  useImperativeHandle(ref, () => ({
    open: (storage: StorageListItem, isOnlyReadModal: boolean = false) => {
      setIsOnlyRead(isOnlyReadModal)
      setStorageId(storage.id)
      setIsModalOpen(true)
      isInitializingFromStorageRef.current = true
      const unitScopeValue =
        storage.units && storage.units.length > 0 ? 'restricted' : 'all'
      const unitIdsValue = storage.units?.map((u) => u.id) ?? []
      const relativeLinkDisplay =
        storage.relativeLink.includes('https://drive.google.com/drive/folders')
          ? storage.relativeLink
          : `https://drive.google.com/drive/folders${storage.relativeLink}`
      form.reset({
        companyId: storage.companyId ?? '',
        relativeLink: relativeLinkDisplay,
        unitScope: unitScopeValue,
        unitIds: unitIdsValue,
      })
      form.setValue('companyId', storage.companyId ?? '')
      form.setValue('relativeLink', relativeLinkDisplay)
      form.setValue('unitScope', unitScopeValue)
      form.setValue('unitIds', unitIdsValue)
      queueMicrotask(() => {
        isInitializingFromStorageRef.current = false
      })
    },
    close: () => setIsModalOpen(false),
  }))

  const formBody = (
    <Form {...form}>
      <form
        id="storage-edit-form"
        onSubmit={form.handleSubmit(handleUpdateStorage)}
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
                      disabled={isOnlyRead}
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
                      disabled={isOnlyRead || hasNoUnits}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="all"
                          id="storage-edit-unit-scope-all"
                          aria-label="Todas as unidades"
                        />
                        <Label
                          htmlFor="storage-edit-unit-scope-all"
                          className="font-normal cursor-pointer"
                        >
                          Todas as unidades
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="restricted"
                          id="storage-edit-unit-scope-restricted"
                          aria-label="Unidades específicas"
                        />
                        <Label
                          htmlFor="storage-edit-unit-scope-restricted"
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
          render={({ field }) => {
            const value = field.value
            const displayValue =
              value && !value.includes('https://drive.google.com/drive/folders')
                ? `https://drive.google.com/drive/folders${value}`
                : value
            return (
              <FormItem className="md:col-span-2">
                <FormLabel>Link para a pasta</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={displayValue}
                    onChange={(e) => {
                      const v = e.target.value.replace(
                        'https://drive.google.com/drive/folders',
                        '',
                      )
                      field.onChange(v ? `https://drive.google.com/drive/folders${v}` : v)
                    }}
                    placeholder="e.g https://drive.google.com/drive/folders/pedroaba-tech"
                    disabled={isOnlyRead || form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
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
            <DrawerTitle>Editar pasta</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para editar a pasta.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{formBody}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>

            {!isOnlyRead && (
              <Button
                type="submit"
                form="storage-edit-form"
                isLoading={form.formState.isSubmitting}
              >
                Salvar
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
          <DialogTitle>Editar pasta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a pasta.
          </DialogDescription>
        </DialogHeader>

        {formBody}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="storage-edit-form"
              isLoading={form.formState.isSubmitting}
            >
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
