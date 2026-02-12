'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getWaterQualityByBoilerReportIdAction } from '@inspetor/actions/boiler/water-quality/get-water-quality-by-boiler-report-id'
import { upsertWaterQualityAction } from '@inspetor/actions/boiler/water-quality/upsert-water-quality'
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
import { nrsForWaterQuality } from '@inspetor/constants/nrs-water-quality'
import { waterQualityQuestions } from '@inspetor/constants/tests'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const defaultQuestions: BoilerReportQuestion[] = waterQualityQuestions.map(
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
  nrs: nrsForWaterQuality.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const waterQualitySchema = z.object({
  observations: z.string().optional(),
  waterPh: z.string().optional(),
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

type WaterQualityFormValues = z.infer<typeof waterQualitySchema>

type WaterQualityFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function WaterQualityForm({
  boilerId,
  action = 'view',
}: WaterQualityFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)

  const form = useForm<WaterQualityFormValues>({
    resolver: zodResolver(waterQualitySchema),
    defaultValues: {
      observations: '',
      waterPh: '',
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getWaterQualityByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados da qualidade da água')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              waterPh?: string
              tests?: unknown
            }
          | undefined
        if (data) {
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            waterPh: data.waterPh ?? '',
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados da qualidade da água')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: WaterQualityFormValues) => {
    try {
      const [result] = await upsertWaterQualityAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
        waterPh: values.waterPh || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados da qualidade da água')
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
              id="water-quality-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Qualidade da Água</FormLabel>
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

              <FormField
                control={form.control}
                name="waterPh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PH da água</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={isViewMode ? '' : 'Ex: 7.5'}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
        formId="water-quality-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
