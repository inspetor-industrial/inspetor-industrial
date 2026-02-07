'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getInjectorGaugeByBoilerReportIdAction } from '@inspetor/actions/boiler/injector-gauge/get-injector-gauge-by-boiler-report-id'
import { upsertInjectorGaugeAction } from '@inspetor/actions/boiler/injector-gauge/upsert-injector-gauge'
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
import { ImageUploadField } from '@inspetor/components/ui/image-upload-field'
import { Input } from '@inspetor/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Textarea } from '@inspetor/components/ui/textarea'
import { nrsForInjectorGauge } from '@inspetor/constants/nrs-injector'
import { injectorQuestions } from '@inspetor/constants/tests'
import { InjectorGaugeFuel } from '@inspetor/generated/prisma/enums'
import { normalizeStoredTests } from '@inspetor/utils/normalize-stored-tests'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const fuelTypeLabels: Record<InjectorGaugeFuel, string> = {
  [InjectorGaugeFuel.LIQUID]: 'Líquido',
  [InjectorGaugeFuel.GASEOUS]: 'Gasoso',
  [InjectorGaugeFuel.SOLID]: 'Sólido',
}

const defaultQuestions: BoilerReportQuestion[] = injectorQuestions.map((q) => ({
  question: q.question,
  answer: (q.answer === 'yes' || q.answer === 'no' ? q.answer : '') as
    | 'yes'
    | 'no'
    | '',
}))

const defaultTests = {
  questions: defaultQuestions,
  nrs: nrsForInjectorGauge.map((nr) => ({
    parent: nr.parent,
    parentSelected: nr.parentSelected,
    children: nr.children.map((c) => ({ selected: c.selected, text: c.text })),
  })),
}

const injectorGaugeSchema = z.object({
  observations: z.string().optional(),
  fuelType: z.nativeEnum(InjectorGaugeFuel, {
    error: 'Tipo de combustível é obrigatório',
  }),
  mark: z.string().min(1, 'Marca é obrigatória'),
  diameter: z.string().min(1, 'Diâmetro é obrigatório'),
  serialNumber: z.string().min(1, 'Número de série é obrigatório'),
  photoDocumentId: z.string().nullish(),
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

type InjectorGaugeFormValues = z.infer<typeof injectorGaugeSchema>

type InjectorGaugeFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function InjectorGaugeForm({
  boilerId,
  action = 'view',
}: InjectorGaugeFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [nrModalOpen, setNrModalOpen] = useState(false)
  const [existingPhotoName, setExistingPhotoName] = useState<string | null>(
    null,
  )

  const form = useForm<InjectorGaugeFormValues>({
    resolver: zodResolver(injectorGaugeSchema),
    defaultValues: {
      observations: '',
      fuelType: undefined,
      mark: '',
      diameter: '',
      serialNumber: '',
      photoDocumentId: undefined,
      tests: defaultTests,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [result] = await getInjectorGaugeByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (!result.success) {
          toast.error('Erro ao carregar dados do injetor')
          return
        }

        const data = result.others?.data as
          | {
              observations?: string
              fuelType?: InjectorGaugeFormValues['fuelType']
              mark?: string
              diameter?: string
              serialNumber?: string
              tests?: unknown
              photos?: Array<{ documentId: string; document: { name: string } }>
            }
          | undefined
        if (data) {
          const firstPhoto = data.photos?.at(0)
          setExistingPhotoName(firstPhoto?.document?.name ?? null)
          const tests = normalizeStoredTests(data.tests)
          form.reset({
            observations: data.observations ?? '',
            fuelType: data.fuelType,
            mark: data.mark ?? '',
            diameter: data.diameter ?? '',
            serialNumber: data.serialNumber ?? '',
            photoDocumentId: firstPhoto?.documentId ?? undefined,
            tests: tests ?? defaultTests,
          })
        }
      } catch {
        toast.error('Erro ao carregar dados do injetor')
      }
    }

    load()
  }, [boilerId, form])

  const onSubmit = async (values: InjectorGaugeFormValues) => {
    try {
      const [result] = await upsertInjectorGaugeAction({
        boilerReportId: boilerId,
        tests: values.tests,
        observations: values.observations || null,
        fuelType: values.fuelType,
        mark: values.mark,
        diameter: values.diameter,
        serialNumber: values.serialNumber,
        photoDocumentId: values.photoDocumentId?.trim() || null,
      })

      if (result?.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result?.message ?? 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar dados do injetor')
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
              id="injector-gauge-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de combustível *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={InjectorGaugeFuel.LIQUID}>
                              {fuelTypeLabels[InjectorGaugeFuel.LIQUID]}
                            </SelectItem>
                            <SelectItem value={InjectorGaugeFuel.GASEOUS}>
                              {fuelTypeLabels[InjectorGaugeFuel.GASEOUS]}
                            </SelectItem>
                            <SelectItem value={InjectorGaugeFuel.SOLID}>
                              {fuelTypeLabels[InjectorGaugeFuel.SOLID]}
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
                  name="mark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: Marca X'}
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
                      <FormLabel>Diâmetro *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 25 mm'}
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
                      <FormLabel>Número de série *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: SN-001'}
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
                name="photoDocumentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto do injetor</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={form.formState.isSubmitting || isViewMode}
                        existingImageName={existingPhotoName ?? undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tests.questions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Testes</FormLabel>
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
        formId="injector-gauge-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
