import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateMaintenanceAction } from '@inspetor/actions/update-maintenance'
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
import { Textarea } from '@inspetor/components/ui/textarea'
import type { DailyMaintenance, Equipment } from '@prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  equipment: z.string({
    message: 'Equipamento é obrigatório',
  }),
  operatorName: z.string({
    message: 'Nome do operador é obrigatório',
  }),
  description: z.string({
    message: 'Descrição é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

type DailyMaintenanceEditModalProps = {
  ref?: RefObject<any>
  equipment: Equipment
}

export function DailyMaintenanceEditModal({
  ref,
  equipment,
}: DailyMaintenanceEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateMaintenanceAction)

  const [dailyMaintenanceId, setDailyMaintenanceId] = useState<string | null>(
    null,
  )
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipment: equipment.id,
      operatorName: '',
      description: '',
    },
  })

  const router = useRouter()

  async function handleUpdateMaintenance(data: Schema) {
    const [result, resultError] = await action.execute({
      dailyMaintenanceId: dailyMaintenanceId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar manutenção diária')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      equipment: '',
      operatorName: '',
      description: '',
    })

    form.setValue('equipment', '')
    form.setValue('operatorName', '')
    form.setValue('description', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (dailyMaintenance: DailyMaintenance, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setDailyMaintenanceId(dailyMaintenance.id)
      setIsModalOpen(true)
      form.reset({
        equipment: dailyMaintenance.equipmentId,
        operatorName: dailyMaintenance.operatorName,
        description: dailyMaintenance.description,
      })

      form.setValue('equipment', dailyMaintenance.equipmentId)
      form.setValue('operatorName', dailyMaintenance.operatorName)
      form.setValue('description', dailyMaintenance.description)
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar manutenção diária</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a manutenção diária.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daily-maintenance-creation-form"
            onSubmit={form.handleSubmit(handleUpdateMaintenance)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento</FormLabel>
                  <FormControl>
                    <Input {...field} disabled value={equipment.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do operador</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g Pedro Augusto"
                      disabled={isOnlyRead}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`• Limpeza dos componentes
• Verificação de funcionamento
• Troca de peças defeituosas`}
                      className="h-40"
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
              form="daily-maintenance-creation-form"
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
