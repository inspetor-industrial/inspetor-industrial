'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getStructureMirrorInfoByBoilerReportIdAction } from '@inspetor/actions/boiler/structure-mirror-info/get-structure-mirror-info-by-boiler-report-id'
import { upsertStructureMirrorInfoAction } from '@inspetor/actions/boiler/structure-mirror-info/upsert-structure-mirror-info'
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
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const structureMirrorInfoSchema = z.object({
  thickness: z.string().optional(),
  diameter: z.string().optional(),
})

type StructureMirrorInfoFormValues = z.infer<typeof structureMirrorInfoSchema>

type StructureMirrorInfoFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function StructureMirrorInfoForm({
  boilerId,
  action = 'view',
}: StructureMirrorInfoFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'

  const form = useForm<StructureMirrorInfoFormValues>({
    resolver: zodResolver(structureMirrorInfoSchema),
    defaultValues: {
      thickness: '',
      diameter: '',
    },
  })

  useEffect(() => {
    const loadStructureMirrorInfo = async () => {
      try {
        const [result] = await getStructureMirrorInfoByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const data = result.others.data
          form.reset({
            thickness: data.thickness?.toString() ?? '',
            diameter: data.diameter?.toString() ?? '',
          })
        }
      } catch {
        toast.error('Erro ao carregar informações do espelho da caldeira')
      }
    }

    loadStructureMirrorInfo()
  }, [boilerId, form])

  const onSubmit = async (data: StructureMirrorInfoFormValues) => {
    try {
      const [result] = await upsertStructureMirrorInfoAction({
        boilerReportId: boilerId,
        thickness: data.thickness ? parseFloat(data.thickness) : null,
        diameter: data.diameter ? parseFloat(data.diameter) : null,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Erro ao salvar informações do espelho da caldeira')
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
              id="structure-mirror-info-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espessura (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 10'}
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
                      <FormLabel>Diâmetro (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 500'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <FormToolbar
        formId="structure-mirror-info-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
