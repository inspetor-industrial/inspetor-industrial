import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateEquipmentAction } from '@inspetor/actions/update-equipment'
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
import type { Equipment } from '@prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
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
  identificationNumber: z.string({
    message: 'Número de identificação é obrigatório',
  }),
  type: z.string({
    message: 'Tipo é obrigatório',
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
})

type Schema = z.infer<typeof schema>

type EquipmentEditModalProps = {
  ref?: RefObject<any>
}

export function EquipmentEditModal({ ref }: EquipmentEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateEquipmentAction)

  const [equipmentId, setEquipmentId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      model: '',
      mark: '',
      type: '',
      identificationNumber: '',
      manufactorYear: '',
      category: '',
      pmta: '',
    },
  })

  const router = useRouter()

  async function handleUpdateEquipment(data: Schema) {
    const [result, resultError] = await action.execute({
      equipmentId: equipmentId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar equipamento')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
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
    })

    form.setValue('name', '')
    form.setValue('model', '')
    form.setValue('mark', '')
    form.setValue('type', '')
    form.setValue('identificationNumber', '')
    form.setValue('manufactorYear', '')
    form.setValue('category', '')
    form.setValue('pmta', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (equipment: Equipment, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setEquipmentId(equipment.id)
      setIsModalOpen(true)
      form.reset({
        name: equipment.name,
        model: equipment.model,
        mark: equipment.mark,
        type: equipment.type,
        identificationNumber: equipment.identificationNumber,
        manufactorYear: equipment.manufactorYear,
        category: equipment.category,
        pmta: equipment.pmta,
      })

      form.setValue('name', equipment.name)
      form.setValue('model', equipment.model)
      form.setValue('mark', equipment.mark)
      form.setValue('type', equipment.type)
      form.setValue('identificationNumber', equipment.identificationNumber)
      form.setValue('manufactorYear', equipment.manufactorYear)
      form.setValue('category', equipment.category)
      form.setValue('pmta', equipment.pmta)
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar equipamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o equipamento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="equipment-creation-form"
            onSubmit={form.handleSubmit(handleUpdateEquipment)}
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
                      placeholder="e.g Válvula de segurança"
                      disabled={isOnlyRead}
                    />
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
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      disabled={isOnlyRead}
                    >
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
                    <Input
                      {...field}
                      placeholder="e.g SN98921"
                      disabled={isOnlyRead}
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g LG"
                      disabled={isOnlyRead}
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g 1234567890"
                      disabled={isOnlyRead}
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g 2024"
                      disabled={isOnlyRead}
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g Válvula de segurança"
                      disabled={isOnlyRead}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pmta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PMTA</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g 1234567890"
                      disabled={isOnlyRead}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="equipment-creation-form"
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
