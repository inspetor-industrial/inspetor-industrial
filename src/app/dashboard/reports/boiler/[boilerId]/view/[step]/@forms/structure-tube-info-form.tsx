'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getStructureTubeInfoByBoilerReportIdAction } from '@inspetor/actions/boiler/structure-tube-info/get-structure-tube-info-by-boiler-report-id'
import { upsertStructureTubeInfoAction } from '@inspetor/actions/boiler/structure-tube-info/upsert-structure-tube-info'
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
import { BoilerTubeMaterial } from '@inspetor/generated/prisma/enums'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const NATURAL_OR_FORCED_OPTIONS = ['NATURAL', 'FORCED'] as const

const structureTubeInfoSchema = z.object({
  length: z.string().min(1, 'Comprimento é obrigatório'),
  diameter: z.string().min(1, 'Diâmetro é obrigatório'),
  thickness: z.string().min(1, 'Espessura é obrigatória'),
  material: z.enum(
    [BoilerTubeMaterial.ASTMA178, BoilerTubeMaterial.NOT_SPECIFIED],
    { error: 'Material é obrigatório' },
  ),
  certificateDocumentId: z.string().optional(),
  isNaturalOrForced: z.enum(NATURAL_OR_FORCED_OPTIONS, {
    error: 'Selecione Natural ou Forçado',
  }),
  quantityOfSafetyFuse: z.string().min(1, 'Quantidade de fusível de segurança é obrigatória'),
})

type StructureTubeInfoFormValues = z.infer<typeof structureTubeInfoSchema>

type StructureTubeInfoFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function StructureTubeInfoForm({
  boilerId,
  action = 'view',
}: StructureTubeInfoFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [existingCertificateName, setExistingCertificateName] = useState<
    string | null
  >(null)

  const form = useForm<StructureTubeInfoFormValues>({
    resolver: zodResolver(structureTubeInfoSchema),
    defaultValues: {
      length: '',
      diameter: '',
      thickness: '',
      material: undefined,
      certificateDocumentId: undefined,
      isNaturalOrForced: undefined,
      quantityOfSafetyFuse: '',
    },
  })

  useEffect(() => {
    const loadStructureTubeInfo = async () => {
      try {
        const [result] = await getStructureTubeInfoByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const data = result.others.data
          setExistingCertificateName(
            data.certificate?.document?.name ?? null,
          )
          form.reset({
            length: data.length,
            diameter: data.diameter,
            thickness: data.thickness,
            material: data.material,
            certificateDocumentId: data.certificate?.documentId ?? undefined,
            isNaturalOrForced: NATURAL_OR_FORCED_OPTIONS.includes(
              data.isNaturalOrForced as (typeof NATURAL_OR_FORCED_OPTIONS)[number],
            )
              ? data.isNaturalOrForced
              : undefined,
            quantityOfSafetyFuse: data.quantityOfSafetyFuse,
          })
        }
      } catch {
        toast.error('Erro ao carregar informações da estrutura dos tubos')
      }
    }

    loadStructureTubeInfo()
  }, [boilerId, form])

  const onSubmit = async (data: StructureTubeInfoFormValues) => {
    try {
      const [result] = await upsertStructureTubeInfoAction({
        boilerReportId: boilerId,
        length: data.length,
        diameter: data.diameter,
        thickness: data.thickness,
        material: data.material,
        certificateId:
          data.certificateDocumentId?.trim() !== ''
            ? data.certificateDocumentId
            : null,
        isNaturalOrForced: data.isNaturalOrForced,
        quantityOfSafetyFuse: data.quantityOfSafetyFuse,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Erro ao salvar informações da estrutura dos tubos')
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
              id="structure-tube-info-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comprimento *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            isViewMode ? '' : 'Ex: 2000 mm'
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
                      <FormLabel>Diâmetro *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            isViewMode ? '' : 'Ex: 500 mm'
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
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espessura *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            isViewMode ? '' : 'Ex: 10 mm'
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
                  name="material"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Material *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isViewMode ? '' : 'Selecione o material'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BoilerTubeMaterial.ASTMA178}>
                              ASTM A178
                            </SelectItem>
                            <SelectItem value={BoilerTubeMaterial.NOT_SPECIFIED}>
                              Não especificado
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
                  name="isNaturalOrForced"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natural ou forçado *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isViewMode ? '' : 'Selecione'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NATURAL">
                              Natural
                            </SelectItem>
                            <SelectItem value="FORCED">
                              Forçado
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
                  name="quantityOfSafetyFuse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de fusível de segurança *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            isViewMode ? '' : 'Ex: 2'
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
                  name="certificateDocumentId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Certificado</FormLabel>
                      <FormControl>
                        <ImageUploadField
                          value={field.value}
                          onChange={field.onChange}
                          disabled={form.formState.isSubmitting || isViewMode}
                          existingImageName={
                            existingCertificateName ?? undefined
                          }
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
        formId="structure-tube-info-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
