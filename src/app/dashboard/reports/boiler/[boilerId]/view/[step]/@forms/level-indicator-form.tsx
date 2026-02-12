'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getLevelIndicatorByBoilerReportIdAction } from '@inspetor/actions/boiler/level-indicator/get-level-indicator-by-boiler-report-id'
import { upsertLevelIndicatorAction } from '@inspetor/actions/boiler/level-indicator/upsert-level-indicator'
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
import { nrsForLevelIndicator } from '@inspetor/constants/nrs-level-indicator'
import { levelIndicatorQuestions } from '@inspetor/constants/tests'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const defaultQuestions: BoilerReportQuestion[] = levelIndicatorQuestions.map(
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
  nrs: nrsForLevelIndicator.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const levelIndicatorSchema = z.object({
  observations: z.string().optional(),
  mark: z.string().optional(),
  glassDiameter: z.string().optional(),
  glassLength: z.string().optional(),
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

type LevelIndicatorFormValues = z.infer<typeof levelIndicatorSchema>

type LevelIndicatorFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function LevelIndicatorForm({
  boilerId,
  action = 'view',
}: LevelIndicatorFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)

  const form = useForm<LevelIndicatorFormValues>({
    resolver: zodResolver(levelIndicatorSchema),
    defaultValues: {
      observations: '',
      mark: '',
      glassDiameter: '',
      glassLength: '',
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getLevelIndicatorByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados do indicador de nível')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              mark?: string
              glassDiameter?: string
              glassLength?: string
              tests?: unknown
            }
          | undefined
        if (data) {
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            mark: data.mark ?? '',
            glassDiameter: data.glassDiameter ?? '',
            glassLength: data.glassLength ?? '',
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados do indicador de nível')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: LevelIndicatorFormValues) => {
    try {
      const [result] = await upsertLevelIndicatorAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
        mark: values.mark || null,
        glassDiameter: values.glassDiameter || null,
        glassLength: values.glassLength || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados do indicador de nível')
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
              id="level-indicator-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Indicador de Nível</FormLabel>
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  name="glassDiameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diâmetro do vidro (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 25'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="glassLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comprimento do vidro (pol)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 12'}
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
        formId="level-indicator-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
