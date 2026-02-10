'use client'

import { updateCompanyUnitAction } from '@inspetor/actions/units/update-company-unit'
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
import { getCompanyUnitsQueryKey } from '@inspetor/hooks/use-company-units-query'
import type { CompanyUnitListItem } from '@inspetor/hooks/use-company-units-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type Schema = z.infer<typeof schema>

type UnitEditModalProps = {
  ref?: RefObject<{
    open: (unit: CompanyUnitListItem) => void
    close: () => void
  } | null>
  companyId: string
}

export const UnitEditModal = ({
  ref: refProp,
  companyId,
}: UnitEditModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [unitId, setUnitId] = useState<string | null>(null)
  const action = useServerAction(updateCompanyUnitAction)
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  })

  async function handleSubmit(data: Schema) {
    if (!unitId) return

    const [result, resultError] = await action.execute({
      unitId,
      name: data.name,
      status: data.status,
    })

    if (resultError) {
      toast.error('Erro ao atualizar unidade')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({
        queryKey: getCompanyUnitsQueryKey(companyId),
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  useImperativeHandle(refProp, () => ({
    open: (unit: CompanyUnitListItem) => {
      setUnitId(unit.id)
      setIsModalOpen(true)
      form.reset({
        name: unit.name,
        status: unit.status as 'ACTIVE' | 'INACTIVE',
      })
    },
    close: () => setIsModalOpen(false),
  }))

  const isSubmitting = form.formState.isSubmitting

  const formContent = (
    <Form {...form}>
      <form
        id="unit-edit-form"
        onSubmit={form.handleSubmit(handleSubmit)}
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
                  placeholder="e.g. Unidade Centro"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
            <DrawerTitle>Editar unidade</DrawerTitle>
            <DrawerDescription>
              Altere os dados da unidade.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">{formContent}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="unit-edit-form"
              isLoading={isSubmitting}
            >
              Salvar
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
          <DialogTitle>Editar unidade</DialogTitle>
          <DialogDescription>
            Altere os dados da unidade.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="unit-edit-form"
            isLoading={isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
