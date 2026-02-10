'use client'

import { createCompanyUnitAction } from '@inspetor/actions/units/create-company-unit'
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
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type Schema = z.infer<typeof schema>

type UnitCreationModalProps = {
  companyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitCreationModal({
  companyId,
  open,
  onOpenChange,
}: UnitCreationModalProps) {
  const action = useServerAction(createCompanyUnitAction)
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
    const [result, resultError] = await action.execute({
      companyId,
      name: data.name,
      status: data.status,
    })

    if (resultError) {
      toast.error('Erro ao criar unidade')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({
        queryKey: getCompanyUnitsQueryKey(companyId),
      })
      form.reset({ name: '', status: 'ACTIVE' })
      onOpenChange(false)
      return
    }

    toast.error(result?.message)
  }

  const formContent = (
    <Form {...form}>
      <form
        id="unit-creation-form"
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
                  disabled={form.formState.isSubmitting}
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
                disabled={form.formState.isSubmitting}
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

  const isSubmitting = form.formState.isSubmitting

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nova unidade</DrawerTitle>
            <DrawerDescription>
              Preencha os campos para cadastrar uma nova unidade.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">{formContent}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="unit-creation-form"
              isLoading={isSubmitting}
            >
              Cadastrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova unidade</DialogTitle>
          <DialogDescription>
            Preencha os campos para cadastrar uma nova unidade.
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
            form="unit-creation-form"
            isLoading={isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
