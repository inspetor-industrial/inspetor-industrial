'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getStructureBodyInfoByBoilerReportIdAction } from '@inspetor/actions/boiler/structure-body-info/get-structure-body-info-by-boiler-report-id'
import { upsertStructureBodyInfoAction } from '@inspetor/actions/boiler/structure-body-info/upsert-structure-body-info'
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
import { BoilerBodyMaterial } from '@inspetor/generated/prisma/enums'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const structureBodyInfoSchema = z.object({
  thickness: z.string().min(1, 'Espessura é obrigatória'),
  diameter: z.string().min(1, 'Diâmetro é obrigatório'),
  length: z.string().min(1, 'Comprimento é obrigatório'),
  material: z.enum(
    [BoilerBodyMaterial.ASTMA285GRC, BoilerBodyMaterial.ASTMA516, BoilerBodyMaterial.NOT_SPECIFIED],
    { errorMap: () => ({ message: 'Material é obrigatório' }) },
  ),
  certificateDocumentId: z.string().optional(),
})

type StructureBodyInfoFormValues = z.infer<typeof structureBodyInfoSchema>

type StructureBodyInfoFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function StructureBodyInfoForm({
  boilerId,
  action = 'view',
}: StructureBodyInfoFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [existingCertificateName, setExistingCertificateName] = useState<
    string | null
  >(null)

  const form = useForm<StructureBodyInfoFormValues>({
    resolver: zodResolver(structureBodyInfoSchema),
    defaultValues: {
      thickness: '',
      diameter: '',
      length: '',
      material: undefined,
      certificateDocumentId: undefined,
    },
  })

  useEffect(() => {
    const loadStructureBodyInfo = async () => {
      try {
        const [result] = await getStructureBodyInfoByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const data = result.others.data
          setExistingCertificateName(
            data.certificate?.document?.name ?? null,
          )
          form.reset({
            thickness: data.thickness,
            diameter: data.diameter,
            length: data.length,
            material: data.material,
            certificateDocumentId: data.certificate?.documentId ?? undefined,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar informações da estrutura do corpo:', error)
      }
    }

    loadStructureBodyInfo()
  }, [boilerId, form])

  const onSubmit = async (data: StructureBodyInfoFormValues) => {
    try {
      const [result] = await upsertStructureBodyInfoAction({
        boilerReportId: boilerId,
        thickness: data.thickness,
        diameter: data.diameter,
        length: data.length,
        material: data.material,
        certificateId:
          data.certificateDocumentId?.trim() !== ''
            ? data.certificateDocumentId
            : null,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar informações da estrutura do corpo:', error)
      toast.error('Erro ao salvar informações da estrutura do corpo')
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
              id="structure-body-info-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectItem value={BoilerBodyMaterial.ASTMA285GRC}>
                              ASTM A285 Gr C
                            </SelectItem>
                            <SelectItem value={BoilerBodyMaterial.ASTMA516}>
                              ASTM A516
                            </SelectItem>
                            <SelectItem value={BoilerBodyMaterial.NOT_SPECIFIED}>
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
        formId="structure-body-info-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
