'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getHydrostaticTestByBoilerReportIdAction } from '@inspetor/actions/boiler/hydrostatic-test/get-hydrostatic-test-by-boiler-report-id'
import { upsertHydrostaticTestAction } from '@inspetor/actions/boiler/hydrostatic-test/upsert-hydrostatic-test'
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
import { nrsForHydrostaticTest } from '@inspetor/constants/nrs-hydrostatic-test'
import { hydrostaticTestQuestions } from '@inspetor/constants/tests'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const defaultQuestions: BoilerReportQuestion[] = hydrostaticTestQuestions.map(
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
  nrs: nrsForHydrostaticTest.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const hydrostaticTestSchema = z.object({
  observations: z.string().optional(),
  pressure: z.string().optional(),
  duration: z.string().optional(),
  procedure: z.string().optional(),
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

type HydrostaticTestFormValues = z.infer<typeof hydrostaticTestSchema>

type HydrostaticTestFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function HydrostaticTestForm({
  boilerId,
  action = 'view',
}: HydrostaticTestFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)

  const form = useForm<HydrostaticTestFormValues>({
    resolver: zodResolver(hydrostaticTestSchema),
    defaultValues: {
      observations: '',
      pressure: '',
      duration: '',
      procedure: '',
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getHydrostaticTestByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados do teste hidrostático')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              pressure?: string
              duration?: string
              procedure?: string
              tests?: unknown
            }
          | undefined
        if (data) {
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            pressure: data.pressure ?? '',
            duration: data.duration ?? '',
            procedure: data.procedure ?? '',
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados do teste hidrostático')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: HydrostaticTestFormValues) => {
    try {
      const [result] = await upsertHydrostaticTestAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
        pressure: values.pressure || null,
        duration: values.duration || null,
        procedure: values.procedure || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados do teste hidrostático')
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
              id="hydrostatic-test-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Teste Hidrostático</FormLabel>
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
                  name="pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão de prova aplicada (kgf/cm²)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 10.5'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (min)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 30'}
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
                name="procedure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedimento</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={
                          isViewMode
                            ? ''
                            : 'Descreva o procedimento do teste (opcional)'
                        }
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
        formId="hydrostatic-test-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
