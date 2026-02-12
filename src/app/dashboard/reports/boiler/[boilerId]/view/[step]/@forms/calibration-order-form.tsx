'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getCalibrationOrderByBoilerReportIdAction } from '@inspetor/actions/boiler/calibration-order/get-calibration-order-by-boiler-report-id'
import { upsertCalibrationOrderAction } from '@inspetor/actions/boiler/calibration-order/upsert-calibration-order'
import { BoilerReportNrSelectorModal } from '@inspetor/components/boiler-report-nr-selector-modal'
import type { BoilerReportQuestion } from '@inspetor/components/boiler-report-questions-table'
import { BoilerReportQuestionsTable } from '@inspetor/components/boiler-report-questions-table'
import { BoilerReportSelectedNrsViewer } from '@inspetor/components/boiler-report-selected-nrs-viewer'
import { Button } from '@inspetor/components/ui/button'
import { Card, CardContent } from '@inspetor/components/ui/card'
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
import { nrsForCalibrationOrder } from '@inspetor/constants/nrs-calibration-order'
import { pressureGaugeQuestions } from '@inspetor/constants/tests'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const defaultQuestions: BoilerReportQuestion[] = pressureGaugeQuestions.map(
  (q) => ({
    question: q.question,
    answer: (q.answer === 'yes' || q.answer === 'no' ? q.answer : '') as
      | 'yes'
      | 'no'
      | '',
  }),
)

const defaultTests = {
  questions: defaultQuestions,
  nrs: nrsForCalibrationOrder.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const calibrationOrderSchema = z.object({
  observations: z.string().optional(),
  capacity: z.string().optional(),
  diameter: z.string().optional(),
  mark: z.string().optional(),
  serialNumber: z.string().optional(),
  tests: z.object({
    questions: z.array(
      z.object({
        question: z.string(),
        answer: z.enum(['yes', 'no']).or(z.literal('')),
      }),
    ),
    nrs: z.array(
      z.object({
        parent: z.string(),
        parentSelected: z.boolean(),
        children: z.array(
          z.object({
            selected: z.boolean(),
            text: z.string(),
          }),
        ),
      }),
    ),
  }),
})

type CalibrationOrderFormValues = z.infer<typeof calibrationOrderSchema>

type CalibrationOrderFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function CalibrationOrderForm({
  boilerId,
  action = 'view',
}: CalibrationOrderFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)

  const form = useForm<CalibrationOrderFormValues>({
    resolver: zodResolver(calibrationOrderSchema),
    defaultValues: {
      observations: '',
      capacity: '',
      diameter: '',
      mark: '',
      serialNumber: '',
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getCalibrationOrderByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados da ordem de calibração')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              capacity?: string
              diameter?: string
              mark?: string
              serialNumber?: string
              tests?: unknown
            }
          | undefined
        if (data) {
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            capacity: data.capacity ?? '',
            diameter: data.diameter ?? '',
            mark: data.mark ?? '',
            serialNumber: data.serialNumber ?? '',
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados da ordem de calibração')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: CalibrationOrderFormValues) => {
    try {
      const [result] = await upsertCalibrationOrderAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
        capacity: values.capacity || null,
        diameter: values.diameter || null,
        mark: values.mark || null,
        serialNumber: values.serialNumber || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados da ordem de calibração')
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/reports/boiler/${boilerId}/view`)
  }

  const handleBack = () => {
    router.push(`/dashboard/reports/boiler/${boilerId}/view`)
  }

  return (
    <>
      <Card className="border-2">
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              id="calibration-order-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Ordem de Calibração</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNrModalOpen(true)}
                        disabled={isViewMode}
                      >
                        Selecionar NR
                      </Button>
                    </div>
                    <FormControl>
                      <div className="rounded-md border">
                        <BoilerReportQuestionsTable
                          questions={field.value}
                          onChange={field.onChange}
                          disabled={isViewMode}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isViewMode && (
                <BoilerReportSelectedNrsViewer
                  items={form.getValues('tests.nrs') ?? []}
                  title="NR's selecionadas"
                />
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Digite a marca'}
                          disabled={isViewMode}
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
                          placeholder={
                            isViewMode ? '' : 'Digite o número de série'
                          }
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diâmetro (pol)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 3'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade (kgf/cm²)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 10'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Observações adicionais (opcional)"
                        rows={3}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tests.nrs"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <BoilerReportNrSelectorModal
                      open={nrModalOpen}
                      onOpenChange={setNrModalOpen}
                      value={field.value}
                      onConfirm={field.onChange}
                      disabled={isViewMode}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <FormToolbar
        formId="calibration-order-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
