'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { BoilerReportWithRelations } from '@inspetor/actions/boiler/get-boiler-report-by-id'
import { updateBoilerReportAction } from '@inspetor/actions/boiler/update-boiler-report'
import { ClientSelect } from '@inspetor/components/client-select'
import { CompanySelect } from '@inspetor/components/company-select'
import { EngineerSelect } from '@inspetor/components/engineer-select'
import { Button } from '@inspetor/components/ui/button'
import { DatePicker } from '@inspetor/components/ui/date-picker'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Textarea } from '@inspetor/components/ui/textarea'
import { BoilerReportType } from '@inspetor/generated/prisma/browser'
import { getBoilerReportsQueryKey } from '@inspetor/hooks/use-boiler-reports-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
  type: z.enum(BoilerReportType, {
    message: 'Tipo de relatório é obrigatório',
  }),
  clientId: z.string({
    message: 'Cliente é obrigatório',
  }),
  motivation: z.string().optional(),
  date: z.date({
    message: 'Data é obrigatória',
  }),
  startTimeOfInspection: z.string({
    message: 'Horário de início da inspeção é obrigatório',
  }),
  endTimeOfInspection: z.string({
    message: 'Horário de término da inspeção é obrigatório',
  }),
  inspectionValidation: z.string().optional(),
  nextInspectionDate: z.date({
    message: 'Data da próxima inspeção é obrigatória',
  }),
  engineerId: z.string({
    message: 'Engenheiro é obrigatório',
  }),
})

type Schema = z.infer<typeof schema>

type BoilerReportEditModalProps = {
  ref?: RefObject<any>
}

export function BoilerReportEditModal({ ref }: BoilerReportEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [boilerReportId, setBoilerReportId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)
  const action = useServerAction(updateBoilerReportAction)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      type: BoilerReportType.INITIAL,
      clientId: '',
      motivation: '',
      startTimeOfInspection: '',
      endTimeOfInspection: '',
      inspectionValidation: '',
      engineerId: '',
    },
  })

  async function handleUpdateBoilerReport(data: Schema) {
    if (!boilerReportId) return

    const payload =
      isAdmin && data.companyId
        ? { boilerReportId, ...data }
        : {
            boilerReportId,
            type: data.type,
            clientId: data.clientId,
            motivation: data.motivation,
            date: data.date,
            startTimeOfInspection: data.startTimeOfInspection,
            endTimeOfInspection: data.endTimeOfInspection,
            inspectionValidation: data.inspectionValidation,
            nextInspectionDate: data.nextInspectionDate,
            engineerId: data.engineerId,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao atualizar relatório de inspeção de caldeira')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({
        queryKey: getBoilerReportsQueryKey(),
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  useImperativeHandle(ref, () => ({
    open: (report: BoilerReportWithRelations, isOnlyReadModal = false) => {
      setIsOnlyRead(isOnlyReadModal)
      setBoilerReportId(report.id)
      setIsModalOpen(true)
      form.reset({
        companyId: report.companyId ?? '',
        type: report.type,
        clientId: report.clientId,
        motivation: report.motivation ?? '',
        date: report.date ? new Date(report.date) : new Date(),
        startTimeOfInspection: report.startTimeOfInspection ?? '',
        endTimeOfInspection: report.endTimeOfInspection ?? '',
        inspectionValidation: report.inspectionValidation ?? '',
        nextInspectionDate: report.nextInspectionDate
          ? new Date(report.nextInspectionDate)
          : new Date(),
        engineerId: report.engineerId,
      })
    },
    close: () => setIsModalOpen(false),
  }))

  const isMobile = useIsMobile()

  const FormContent = (
    <Form {...form}>
          <form
            id="boiler-report-edit-form"
            className="grid md:grid-cols-2 gap-4"
            onSubmit={form.handleSubmit(handleUpdateBoilerReport)}
          >
            {isAdmin && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                  <FormLabel>Tipo de relatório</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      >
                        <SelectValue placeholder="Selecione o tipo de relatório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BoilerReportType.INITIAL}>
                          Inicial
                        </SelectItem>
                        <SelectItem value={BoilerReportType.PERIODIC}>
                          Periódico
                        </SelectItem>
                        <SelectItem value={BoilerReportType.EXTRAORDINARY}>
                          Extraordinário
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
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <ClientSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione o cliente"
                      label="Cliente"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Motivação</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva a motivação do relatório (opcional)"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione a data"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextInspectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da próxima inspeção</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Próxima data"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTimeOfInspection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de início da inspeção</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      placeholder="Selecione o horário de início"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTimeOfInspection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de término da inspeção</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      placeholder="Selecione o horário de término"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspectionValidation"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Validação da inspeção</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva a validação da inspeção (opcional)"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engineerId"
              render={({ field }) => (
                <FormItem className="md:col-span-2 space-y-1.5">
                  <FormLabel>Engenheiro</FormLabel>
                  <FormControl>
                    <EngineerSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione o engenheiro"
                      label="Engenheiro"
                      disabled={isOnlyRead || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isOnlyRead ? 'Visualizar' : 'Editar'} Relatório de Inspeção de
              Caldeira
            </DrawerTitle>
            <DrawerDescription>
              {isOnlyRead
                ? 'Visualize os dados do relatório de inspeção de caldeira.'
                : 'Preencha os campos abaixo para editar o relatório de inspeção de caldeira.'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormContent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
              >
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>

            {!isOnlyRead && (
              <Button
                type="submit"
                form="boiler-report-edit-form"
                icon={Save}
                isLoading={form.formState.isSubmitting}
              >
                Salvar
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isOnlyRead ? 'Visualizar' : 'Editar'} Relatório de Inspeção de
            Caldeira
          </DialogTitle>
          <DialogDescription>
            {isOnlyRead
              ? 'Visualize os dados do relatório de inspeção de caldeira.'
              : 'Preencha os campos abaixo para editar o relatório de inspeção de caldeira.'}
          </DialogDescription>
        </DialogHeader>

        {FormContent}

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
            >
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="boiler-report-edit-form"
              icon={Save}
              isLoading={form.formState.isSubmitting}
            >
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
