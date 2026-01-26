import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateValveAction } from '@inspetor/actions/update-valve'
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
import type { Valve } from '@inspetor/generated/prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  serialNumber: z.string({
    message: 'Número de série é obrigatório',
  }),
  model: z.string({
    message: 'Modelo é obrigatório',
  }),
  diameter: z.string({
    message: 'Diâmetro é obrigatório',
  }),
  flow: z.string({
    message: 'Vazão é obrigatória',
  }),
  openingPressure: z.string({
    message: 'Pressão de abertura é obrigatória',
  }),
  closingPressure: z.string({
    message: 'Pressão de fechamento é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

type ValveEditModalProps = {
  ref?: RefObject<any>
}

export function ValveEditModal({ ref }: ValveEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateValveAction)

  const [valveId, setValveId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      serialNumber: '',
      model: '',
      diameter: '',
      flow: '',
      openingPressure: '',
      closingPressure: '',
    },
  })

  const router = useRouter()

  async function handleUpdateValve(data: Schema) {
    const [result, resultError] = await action.execute({
      valveId: valveId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar válvula')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      serialNumber: '',
      model: '',
      diameter: '',
      flow: '',
      openingPressure: '',
      closingPressure: '',
    })

    form.setValue('serialNumber', '')
    form.setValue('model', '')
    form.setValue('diameter', '')
    form.setValue('flow', '')
    form.setValue('openingPressure', '')
    form.setValue('closingPressure', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (valve: Valve, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setValveId(valve.id)
      setIsModalOpen(true)
      form.reset({
        serialNumber: valve.serialNumber,
        model: valve.model,
        diameter: String(valve.diameter),
        flow: String(valve.flow),
        openingPressure: String(valve.openingPressure),
        closingPressure: String(valve.closingPressure),
      })

      form.setValue('serialNumber', valve.serialNumber)
      form.setValue('model', valve.model)
      form.setValue('diameter', String(valve.diameter))
      form.setValue('flow', String(valve.flow))
      form.setValue('openingPressure', String(valve.openingPressure))
      form.setValue('closingPressure', String(valve.closingPressure))
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar válvula</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a válvula.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="valve-edit-form"
            onSubmit={form.handleSubmit(handleUpdateValve)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de série</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. VSN-123456"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
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
                      placeholder="e.g. VLV-2000"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="diameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diâmetro (mm)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 50.00"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vazão (m3/h)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 100.00"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressão de abertura (bar)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10.00"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closingPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressão de fechamento (bar)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 8.00"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              form="valve-edit-form"
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
