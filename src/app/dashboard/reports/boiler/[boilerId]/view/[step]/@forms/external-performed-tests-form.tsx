'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getExternalPerformedTestsByBoilerReportIdAction } from '@inspetor/actions/boiler/external-performed-tests/get-external-performed-tests-by-boiler-report-id'
import { upsertExternalPerformedTestsAction } from '@inspetor/actions/boiler/external-performed-tests/upsert-external-performed-tests'
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
import { Textarea } from '@inspetor/components/ui/textarea'
import { nrsForExternalTests } from '@inspetor/constants/nrs-external-tests'
import { tableExternExamsQuestions } from '@inspetor/constants/tests'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const defaultQuestions: BoilerReportQuestion[] = tableExternExamsQuestions.map(
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
  nrs: nrsForExternalTests.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const externalPerformedTestsSchema = z.object({
  observations: z.string().optional(),
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

type ExternalPerformedTestsFormValues = z.infer<
  typeof externalPerformedTestsSchema
>

type ExternalPerformedTestsFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function ExternalPerformedTestsForm({
  boilerId,
  action = 'view',
}: ExternalPerformedTestsFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)

  const form = useForm<ExternalPerformedTestsFormValues>({
    resolver: zodResolver(externalPerformedTestsSchema),
    defaultValues: {
      observations: '',
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getExternalPerformedTestsByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados dos testes externos')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              tests?: unknown
            }
          | undefined
        if (data) {
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados dos testes externos')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: ExternalPerformedTestsFormValues) => {
    try {
      const [result] = await upsertExternalPerformedTestsAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados dos testes externos')
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
              id="external-performed-tests-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Testes Externos</FormLabel>
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
        formId="external-performed-tests-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
