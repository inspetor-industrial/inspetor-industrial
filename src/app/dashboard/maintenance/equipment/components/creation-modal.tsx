'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createEquipmentAction } from '@inspetor/actions/create-equipment'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { getEquipmentQueryKey } from '@inspetor/hooks/use-equipment-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useSession } from '@inspetor/lib/auth/context'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string({
    message: 'Nome é obrigatório',
  }),
  mark: z.string({
    message: 'Marca é obrigatória',
  }),
  type: z.string({
    message: 'Tipo é obrigatório',
  }),
  identificationNumber: z.string({
    message: 'Número de identificação é obrigatório',
  }),
  manufactorYear: z
    .string({
      message: 'Ano de fabricação é obrigatório',
    })
    .min(4, {
      message: 'Ano de fabricação deve ter 4 dígitos',
    })
    .regex(/^\d{4}$/, {
      message: 'Ano de fabricação deve ter 4 dígitos',
    }),
  model: z.string({
    message: 'Modelo é obrigatório',
  }),
  category: z.string({
    message: 'Categoria é obrigatória',
  }),
  pmta: z.string({
    message: 'PMTA é obrigatório',
  }),
  companyId: z.string().optional(),
})

type Schema = z.infer<typeof schema>

export function EquipmentCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isMobile = useIsMobile()

  const session = useSession()
  const isAdmin = session.data?.user?.role === 'ADMIN'

  const action = useServerAction(createEquipmentAction)
  const queryClient = useQueryClient()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleCreateEquipment(data: Schema) {
    const payload =
      isAdmin && data.companyId ? data : { ...data, companyId: undefined }
    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      const message =
        resultError instanceof Error
          ? resultError.message
          : ((resultError as { message?: string })?.message ??
            'Erro ao criar equipamento')
      toast.error(message)
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getEquipmentQueryKey() })
    } else {
      toast.error(result?.message)
    }

    form.reset({
      name: '',
      model: '',
      mark: '',
      identificationNumber: '',
      manufactorYear: '',
      category: '',
      pmta: '',
      companyId: '',
    })

    form.setValue('name', '')
    form.setValue('model', '')
    form.setValue('mark', '')
    form.setValue('identificationNumber', '')
    form.setValue('manufactorYear', '')
    form.setValue('category', '')
    form.setValue('pmta', '')
    form.setValue('companyId', '')

    setIsModalOpen(false)
  }

  const formBody = (
    <Form {...form}>
      <form
        id="equipment-creation-form"
        onSubmit={form.handleSubmit(handleCreateEquipment)}
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g Válvula de segurança" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boiler">Caldeira</SelectItem>
                    <SelectItem value="pressure-vessel">
                      Vaso de pressão
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g SN98921" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g LG" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identificationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de identificação</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g 1234567890" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufactorYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano de fabricação</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g 2024" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g Válvula de segurança" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pmta"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>PMTA</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g 1234567890" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )

  const trigger = <Button icon={IconPlus}>Criar equipamento</Button>

  const footer = (
    <>
      <DrawerClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DrawerClose>
      <Button
        type="submit"
        form="equipment-creation-form"
        isLoading={form.formState.isSubmitting}
      >
        Criar
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Criar equipamento</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para registrar um novo equipamento.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar equipamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar um novo equipamento.
          </DialogDescription>
        </DialogHeader>
        {formBody}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            form="equipment-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
