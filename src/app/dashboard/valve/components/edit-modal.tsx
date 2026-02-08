import { zodResolver } from '@hookform/resolvers/zod'
import { updateValveAction } from '@inspetor/actions/update-valve'
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
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import {
  getValvesQueryKey,
  type ValveListItem,
} from '@inspetor/hooks/use-valves-query'
import { useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
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

  const isMobile = useIsMobile()

  const [valveId, setValveId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      serialNumber: '',
      model: '',
      diameter: '',
      flow: '',
      openingPressure: '',
      closingPressure: '',
    },
  })

  const queryClient = useQueryClient()

  async function handleUpdateValve(data: Schema) {
    if (!valveId) return

    const payload =
      isAdmin && data.companyId
        ? { valveId, ...data }
        : {
            valveId,
            serialNumber: data.serialNumber,
            model: data.model,
            diameter: data.diameter,
            flow: data.flow,
            openingPressure: data.openingPressure,
            closingPressure: data.closingPressure,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao editar válvula')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getValvesQueryKey() })
      form.reset({
        companyId: '',
        serialNumber: '',
        model: '',
        diameter: '',
        flow: '',
        openingPressure: '',
        closingPressure: '',
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="valve-edit-form"
        onSubmit={form.handleSubmit(handleUpdateValve)}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
  )

  useImperativeHandle(ref, () => ({
    open: (valve: ValveListItem, isOnlyRead = false) => {
      setIsOnlyRead(isOnlyRead)
      setValveId(valve.id)
      setIsModalOpen(true)
      form.reset({
        companyId: valve.companyId ?? '',
        serialNumber: valve.serialNumber,
        model: valve.model,
        diameter: String(valve.diameter),
        flow: String(valve.flow),
        openingPressure: String(valve.openingPressure),
        closingPressure: String(valve.closingPressure),
      })

      form.setValue('companyId', valve.companyId ?? '')
      form.setValue('serialNumber', valve.serialNumber)
      form.setValue('model', valve.model)
      form.setValue('diameter', String(valve.diameter))
      form.setValue('flow', String(valve.flow))
      form.setValue('openingPressure', String(valve.openingPressure))
      form.setValue('closingPressure', String(valve.closingPressure))
    },
    close: () => setIsModalOpen(false),
  }))

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar válvula</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para editar a válvula.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>

            {!isOnlyRead && (
              <Button
                type="submit"
                form="valve-edit-form"
                isLoading={form.formState.isSubmitting}
              >
                Editar
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
          <DialogTitle>Editar válvula</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a válvula.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
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
