'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateInstrumentAction } from '@inspetor/actions/update-instrument'
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
import type { InstrumentListItem } from '@inspetor/hooks/use-instruments-query'
import { getInstrumentsQueryKey } from '@inspetor/hooks/use-instruments-query'
import { useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
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
  ref?: RefObject<{
    open: (instrument: InstrumentListItem, isOnlyRead?: boolean) => void
  } | null>
}

export function InstrumentEditModal({ ref }: InstrumentEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateInstrumentAction)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const [instrumentId, setInstrumentId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      type: '',
      manufacturer: '',
      serialNumber: '',
      certificateNumber: '',
      validationDate: { month: '', year: '' },
    },
  })

  async function handleUpdateInstrument(data: Schema) {
    if (!instrumentId) return

    const payload =
      isAdmin && data.companyId
        ? { instrumentId, ...data }
        : {
            instrumentId,
            type: data.type,
            manufacturer: data.manufacturer,
            serialNumber: data.serialNumber,
            certificateNumber: data.certificateNumber,
            validationDate: data.validationDate,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao editar instrumento')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getInstrumentsQueryKey() })
      form.reset({
        companyId: '',
        type: '',
        manufacturer: '',
        serialNumber: '',
        certificateNumber: '',
        validationDate: { month: '', year: '' },
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  useImperativeHandle(ref, () => ({
    open: (instrument: InstrumentListItem, isOnlyReadModal = false) => {
      setIsOnlyRead(isOnlyReadModal)
      setInstrumentId(instrument.id)
      setIsModalOpen(true)
      const month = String(instrument.validationDate.getUTCMonth() + 1).padStart(
        2,
        '0',
      )
      const year = instrument.validationDate.getFullYear().toString().slice(-2)
      form.reset({
        companyId: instrument.companyId ?? '',
        type: instrument.type,
        manufacturer: instrument.manufacturer,
        serialNumber: instrument.serialNumber,
        certificateNumber: instrument.certificateNumber,
        validationDate: { month, year },
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
            id="instrument-edit-form"
            onSubmit={form.handleSubmit(handleUpdateInstrument)}
            className="space-y-4"
          >
            {isAdmin && (
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
                        placeholder="Selecione a empresa"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                        label="Empresa"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    >
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
                    <Input
                      {...field}
                      placeholder="e.g. Pedroaba Tech"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                      aria-label="Fabricante"
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g. 1234567890"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                      aria-label="Número de série"
                    />
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
                    <Input
                      {...field}
                      placeholder="e.g. 1234567890"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                      aria-label="Número de certificado"
                    />
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
                      disabled={isOnlyRead || form.formState.isSubmitting}
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
            <Button type="button" variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="instrument-edit-form"
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
