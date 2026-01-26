import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerMaintenanceAction } from '@inspetor/actions/register-maintenance'
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
import { Label } from '@inspetor/components/ui/label'
import { Textarea } from '@inspetor/components/ui/textarea'
import type { Equipment } from '@inspetor/generated/prisma/client'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  equipment: z
    .string({
      message: 'Equipamento é obrigatório',
    })
    .optional(),
  operatorName: z.string({
    message: 'Nome do operador é obrigatório',
  }),
  description: z.string({
    message: 'Descrição é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

type DailyMaintenanceCreationModalProps = {
  equipment: Equipment
}

export function DailyMaintenanceCreationModal({
  equipment,
}: DailyMaintenanceCreationModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const action = useServerAction(registerMaintenanceAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipment: equipment.id,
      operatorName: '',
      description: '',
    },
  })

  const router = useRouter()

  async function handleRegisterMaintenance(data: Schema) {
    const [result, resultError] = await action.execute({
      ...data,
      equipmentId: equipment.id,
    })

    if (resultError) {
      toast.error('Erro ao registrar manutenção diária')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      equipment: equipment.id,
      operatorName: '',
      description: '',
    })

    form.setValue('equipment', equipment.id)
    form.setValue('operatorName', '')
    form.setValue('description', '')

    setIsModalOpen(false)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Registrar manutenção diária</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar manutenção diária</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar uma nova manutenção diária.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daily-maintenance-creation-form"
            onSubmit={form.handleSubmit(handleRegisterMaintenance)}
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
                    <Input {...field} placeholder="e.g Pedro Augusto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 flex-col">
              <Label>Data do registro</Label>
              <Input
                value={new Date().toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                disabled
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição dos serviços</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`• Limpeza dos componentes
• Verificação de funcionamento
• Troca de peças defeituosas`}
                      className="h-40"
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
            form="daily-maintenance-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
