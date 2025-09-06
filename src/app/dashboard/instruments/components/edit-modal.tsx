import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateInstrumentAction } from '@inspetor/actions/update-instrument'
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
import { MonthInput } from '@inspetor/components/ui/month-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import type { Instruments } from '@prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
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

type InstrumentEditModalProps = {
  ref?: RefObject<any>
}

export function InstrumentEditModal({ ref }: InstrumentEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateInstrumentAction)

  const [instrumentId, setInstrumentId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: '',
      manufacturer: '',
      serialNumber: '',
      certificateNumber: '',
      validationDate: {
        month: '',
        year: '',
      },
    },
  })

  const router = useRouter()

  async function handleUpdateInstrument(data: Schema) {
    const [result, resultError] = await action.execute({
      instrumentId: instrumentId,
      ...data,
    })

    if (resultError) {
      console.log(resultError)
      toast.error('Erro ao editar instrumento')
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

  useImperativeHandle(ref, () => ({
    open: (instrument: Instruments, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setInstrumentId(instrument.id)
      setIsModalOpen(true)
      form.reset({
        type: instrument.type,
        manufacturer: instrument.manufacturer,
        serialNumber: instrument.serialNumber,
        certificateNumber: instrument.certificateNumber,
        validationDate: {
          month: instrument.validationDate.getMonth().toString(),
          year: instrument.validationDate.getFullYear().toString(),
        },
      })

      form.setValue('type', instrument.type)
      form.setValue('manufacturer', instrument.manufacturer)
      form.setValue('serialNumber', instrument.serialNumber)
      form.setValue('certificateNumber', instrument.certificateNumber)
      form.setValue('validationDate', {
        month: String(instrument.validationDate.getUTCMonth() + 1).padStart(
          2,
          '0',
        ),
        year: instrument.validationDate.getFullYear().toString().slice(-2),
      })
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar instrumento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o instrumento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="instrument-creation-form"
            onSubmit={form.handleSubmit(handleUpdateInstrument)}
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
                      value={
                        form.getValues('validationDate.month') &&
                        form.getValues('validationDate.year')
                          ? `${form.getValues('validationDate.month')}/${form.getValues('validationDate.year')}`
                          : ''
                      }
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
            <Button variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="instrument-creation-form"
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
