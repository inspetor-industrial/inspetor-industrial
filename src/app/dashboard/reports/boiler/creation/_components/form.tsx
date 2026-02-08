'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createBoilerReportAction } from '@inspetor/actions/boiler/create-boiler-report'
import { ClientSelect } from '@inspetor/components/client-select'
import { CompanySelect } from '@inspetor/components/company-select'
import { EngineerSelect } from '@inspetor/components/engineer-select'
import { Button } from '@inspetor/components/ui/button'
import { DatePicker } from '@inspetor/components/ui/date-picker'
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
import { cn } from '@inspetor/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string({
    message: 'Empresa é obrigatória',
  }),
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

export function BoilerCreationForm() {
  const action = useServerAction(createBoilerReportAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
    },
  })

  const router = useRouter()

  async function handleCreateBoilerReport(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      toast.error('Erro ao criar relatório de inspeção de caldeira')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.push('/dashboard/reports/boiler')

      return
    }

    toast.error(result?.message)
  }

  return (
    <Form {...form}>
      <form
        className="grid md:grid-cols-2 gap-4"
        onSubmit={form.handleSubmit(handleCreateBoilerReport)}
      >
        <FormField
          control={form.control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <CompanySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione a empresa"
                  label="Empresa"
                />
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
              <FormLabel>Tipo de relatório</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
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
                  placeholder="Selecione a data da próxima inspeção"
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
            <FormItem>
              <FormLabel>Engenheiro</FormLabel>
              <FormControl>
                <EngineerSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione o engenheiro"
                  label="Engenheiro"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 w-full flex justify-end gap-2">
          <Link
            href="/dashboard/reports/boiler"
            className={cn(
              'grow md:w-fit md:grow-0',
              form.formState.isSubmitting &&
                'opacity-50 cursor-not-allowed pointer-events-none',
            )}
          >
            <Button type="button" variant="outline" className="w-full">
              <ArrowLeft />
              Voltar
            </Button>
          </Link>
          <Button
            type="submit"
            className="grow md:w-fit md:grow-0"
            icon={Save}
            isLoading={form.formState.isSubmitting}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}
