import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEquipmentAction } from '@inspetor/actions/create-equipment'
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
import { IconPlus } from '@tabler/icons-react'
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
})

type Schema = z.infer<typeof schema>

export function EquipmentCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const action = useServerAction(createEquipmentAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleCreateEquipment(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      toast.error('Erro ao criar equipamento')
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
    form.setValue('identificationNumber', '')
    form.setValue('manufactorYear', '')
    form.setValue('category', '')
    form.setValue('pmta', '')

    setIsModalOpen(false)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Criar equipamento</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar equipamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar um novo equipamento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="equipment-creation-form"
            onSubmit={form.handleSubmit(handleCreateEquipment)}
            className="space-y-4"
          >
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
                <FormItem>
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
