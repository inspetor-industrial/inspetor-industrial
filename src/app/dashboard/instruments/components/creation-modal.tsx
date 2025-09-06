import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInstrumentAction } from '@inspetor/actions/create-instrument'
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
import { MonthInput } from '@inspetor/components/ui/month-input'
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
  type: z.string({
    message: 'Tipo é obrigatório',
  }),
  manufacturer: z.string({
    message: 'Fabricante é obrigatório',
  }),
  serialNumber: z.string({
    message: 'Número de série é obrigatório',
  }),
  certificateNumber: z.string({
    message: 'Número de certificado é obrigatório',
  }),
  validationDate: z.object({
    month: z.string(),
    year: z.string(),
  }),
})

type Schema = z.infer<typeof schema>

export function InstrumentCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createInstrumentAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleCreateInstrument(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      console.log(resultError)
      toast.error('Erro ao criar instrumento')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      type: '',
      manufacturer: '',
      serialNumber: '',
      certificateNumber: '',
      validationDate: {
        month: '',
        year: '',
      },
    })

    form.setValue('type', '')
    form.setValue('manufacturer', '')
    form.setValue('serialNumber', '')
    form.setValue('certificateNumber', '')
    form.setValue('validationDate', {
      month: '',
      year: '',
    })

    setIsModalOpen(false)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Cadastrar instrumento</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar instrumento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo instrumento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="instrument-creation-form"
            onSubmit={form.handleSubmit(handleCreateInstrument)}
            className="space-y-4"
          >
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
                        <SelectItem value="standard-manometer">
                          Manômetro padrão
                        </SelectItem>
                        <SelectItem value="ultrasonic-thickness-gauge">
                          Medidor de espessura Ultrassônico
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
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Pedroaba Tech" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de série</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de certificado</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de validação</FormLabel>
                  <FormControl>
                    <MonthInput
                      onChange={(event) => {
                        const value = event.target.value

                        field.onChange({
                          month: value.split('/')[0],
                          year: value.split('/')[1],
                        })
                      }}
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
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="instrument-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
