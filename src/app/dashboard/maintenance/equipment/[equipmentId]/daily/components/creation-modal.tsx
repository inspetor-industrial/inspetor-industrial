'use client'

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
import { Label } from '@inspetor/components/ui/label'
import { Textarea } from '@inspetor/components/ui/textarea'
import type { Equipment } from '@inspetor/generated/prisma/client'
import { getDailyMaintenanceQueryKey } from '@inspetor/hooks/use-daily-maintenance-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
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
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const action = useServerAction(registerMaintenanceAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipment: equipment.id,
      operatorName: '',
      description: '',
    },
  })

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
      await queryClient.invalidateQueries({
        queryKey: getDailyMaintenanceQueryKey(),
      })
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

  const formBody = (
    <Form {...form}>
      <form
        id="daily-maintenance-creation-form"
        onSubmit={form.handleSubmit(handleRegisterMaintenance)}
        className="flex flex-col gap-4 md:gap-x-6 md:gap-y-4"
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
  )

  const trigger = <Button icon={IconPlus}>Registrar manutenção diária</Button>

  const drawerFooter = (
    <>
      <DrawerClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DrawerClose>
      <Button
        type="submit"
        form="daily-maintenance-creation-form"
        isLoading={form.formState.isSubmitting}
      >
        Registrar
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
            <DrawerTitle>Registrar manutenção diária</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para registrar uma nova manutenção
              diária.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">{formBody}</div>
          <DrawerFooter>{drawerFooter}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar manutenção diária</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar uma nova manutenção diária.
          </DialogDescription>
        </DialogHeader>
        {formBody}
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
