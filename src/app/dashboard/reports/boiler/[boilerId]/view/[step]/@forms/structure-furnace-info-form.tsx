'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getStructureFurnaceInfoByBoilerReportIdAction } from '@inspetor/actions/boiler/structure-furnace-info/get-structure-furnace-info-by-boiler-report-id'
import { upsertStructureFurnaceInfoAction } from '@inspetor/actions/boiler/structure-furnace-info/upsert-structure-furnace-info'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { StructureFurnaceType } from '@inspetor/generated/prisma/enums'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const structureFurnaceInfoSchema = z.object({
  heatingSurface: z.string().optional(),
  surfaceType: z.enum(StructureFurnaceType, {
    error: () => ({ message: 'Tipo de superfície é obrigatório' }),
  }),
  width: z.string().optional(),
  height: z.string().optional(),
  length: z.string().optional(),
  diameter: z.string().optional(),
  tubeDiameter: z.string().optional(),
  tubeThickness: z.string().optional(),
  freeLengthWithoutStays: z.string().optional(),
})

type StructureFurnaceInfoFormValues = z.infer<typeof structureFurnaceInfoSchema>

type StructureFurnaceInfoFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function StructureFurnaceInfoForm({
  boilerId,
  action = 'view',
}: StructureFurnaceInfoFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'

  const form = useForm<StructureFurnaceInfoFormValues>({
    resolver: zodResolver(structureFurnaceInfoSchema),
    defaultValues: {
      heatingSurface: '',
      surfaceType: undefined,
      width: '',
      height: '',
      length: '',
      diameter: '',
      tubeDiameter: '',
      tubeThickness: '',
      freeLengthWithoutStays: '',
    },
  })

  const surfaceType = useWatch({
    control: form.control,
    name: 'surfaceType',
  })

  useEffect(() => {
    const loadStructureFurnaceInfo = async () => {
      try {
        const [result] = await getStructureFurnaceInfoByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const data = result.others.data
          form.reset({
            heatingSurface: data.heatingSurface?.toString() ?? '',
            surfaceType: data.surfaceType,
            width: data.width?.toString() ?? '',
            height: data.height?.toString() ?? '',
            length: data.length?.toString() ?? '',
            diameter: data.diameter?.toString() ?? '',
            tubeDiameter: data.tubeDiameter?.toString() ?? '',
            tubeThickness: data.tubeThickness?.toString() ?? '',
            freeLengthWithoutStays:
              data.freeLengthWithoutStays?.toString() ?? '',
          })
        }
      } catch {
        toast.error('Erro ao carregar informações da estrutura da fornalha')
      }
    }

    loadStructureFurnaceInfo()
  }, [boilerId, form])

  const onSubmit = async (data: StructureFurnaceInfoFormValues) => {
    try {
      const [result] = await upsertStructureFurnaceInfoAction({
        boilerReportId: boilerId,
        heatingSurface: data.heatingSurface
          ? parseFloat(data.heatingSurface)
          : null,
        surfaceType: data.surfaceType,
        width: data.width ? parseFloat(data.width) : null,
        height: data.height ? parseFloat(data.height) : null,
        length: data.length ? parseFloat(data.length) : null,
        diameter: data.diameter ? parseFloat(data.diameter) : null,
        tubeDiameter: data.tubeDiameter ? parseFloat(data.tubeDiameter) : null,
        tubeThickness: data.tubeThickness
          ? parseFloat(data.tubeThickness)
          : null,
        freeLengthWithoutStays: data.freeLengthWithoutStays
          ? parseFloat(data.freeLengthWithoutStays)
          : null,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Erro ao salvar informações da estrutura da fornalha')
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
              id="structure-furnace-info-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heatingSurface"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Superfície de aquecimento (m²)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 15.5'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surfaceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo da superfície *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={isViewMode ? '' : 'Selecione o tipo'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={StructureFurnaceType.REFRACTORY}>
                              Refratária
                            </SelectItem>
                            <SelectItem value={StructureFurnaceType.COOLED}>
                              Refrigerada
                            </SelectItem>
                            <SelectItem value={StructureFurnaceType.WATER_TUBE}>
                              Aquatubular
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
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 1000'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 2000'}
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
                      <FormLabel>Comprimento (mm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={isViewMode ? '' : 'Ex: 3000'}
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
                          placeholder={isViewMode ? '' : 'Ex: 1500'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {surfaceType === StructureFurnaceType.WATER_TUBE && (
                  <>
                    <FormField
                      control={form.control}
                      name="tubeDiameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diâmetro do tubo (mm)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder={isViewMode ? '' : 'Ex: 50'}
                              disabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tubeThickness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espessura do tubo (mm)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder={isViewMode ? '' : 'Ex: 3.5'}
                              disabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="freeLengthWithoutStays"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Comprimento livre sem tirantes (mm)</FormLabel>
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
        formId="structure-furnace-info-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
