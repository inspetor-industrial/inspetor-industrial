'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getBoilerInfoByBoilerReportIdAction } from '@inspetor/actions/boiler/boiler-info/get-boiler-info-by-boiler-report-id'
import { upsertBoilerInfoAction } from '@inspetor/actions/boiler/boiler-info/upsert-boiler-info'
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
import {
  BoilerCategory,
  BoilerFuelType,
  BoilerType,
} from '@inspetor/generated/prisma/enums'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const boilerInfoSchema = z.object({
  manufacturer: z.string().optional(),
  mark: z.string().optional(),
  type: z.enum(BoilerType, {
    error: 'Tipo de caldeira é obrigatório',
  }),
  model: z.string().optional(),
  yearOfManufacture: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (/^\d{4}$/.test(val) &&
          Number(val) >= 1900 &&
          Number(val) <= new Date().getFullYear() + 1),
      {
        message: 'Ano inválido',
      },
    ),
  maximumWorkingPressure: z.string().optional(),
  maximumOperatingPressure: z.string().optional(),
  series: z.string().optional(),
  fuelType: z.enum(BoilerFuelType, {
    error: 'Tipo de combustível é obrigatório',
  }),
  category: z.enum(BoilerCategory, {
    error: 'Categoria é obrigatória',
  }),
})

type BoilerInfoFormValues = z.infer<typeof boilerInfoSchema>

type BoilerInfoFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function BoilerInfoForm({
  boilerId,
  action = 'view',
}: BoilerInfoFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'

  const form = useForm<BoilerInfoFormValues>({
    resolver: zodResolver(boilerInfoSchema),
    defaultValues: {
      manufacturer: '',
      mark: '',
      type: undefined,
      model: '',
      yearOfManufacture: undefined,
      maximumWorkingPressure: '',
      maximumOperatingPressure: '',
      series: '',
      fuelType: undefined,
      category: undefined,
    },
  })

  useEffect(() => {
    const loadBoilerInfo = async () => {
      try {
        const [result] = await getBoilerInfoByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const boilerInfo = result.others.data
          form.reset({
            manufacturer: boilerInfo.manufacturer,
            mark: boilerInfo.mark,
            type: boilerInfo.type,
            model: boilerInfo.model,
            yearOfManufacture:
              String(boilerInfo.yearOfManufacture) ?? undefined,
            maximumWorkingPressure: boilerInfo.maximumWorkingPressure,
            maximumOperatingPressure: boilerInfo.maximumOperatingPressure,
            series: boilerInfo.series,
            fuelType: boilerInfo.fuelType,
            category: boilerInfo.category,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar informações da caldeira:', error)
      }
    }

    loadBoilerInfo()
  }, [boilerId, form])

  const onSubmit = async (data: BoilerInfoFormValues) => {
    try {
      const [result] = await upsertBoilerInfoAction({
        boilerReportId: boilerId,
        manufacturer: data.manufacturer,
        mark: data.mark,
        type: data.type,
        model: data.model,
        yearOfManufacture: data.yearOfManufacture
          ? parseInt(data.yearOfManufacture)
          : undefined,
        maximumWorkingPressure: data.maximumWorkingPressure,
        maximumOperatingPressure: data.maximumOperatingPressure,
        series: data.series,
        fuelType: data.fuelType,
        category: data.category,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar informações da caldeira:', error)
      toast.error('Erro ao salvar informações da caldeira')
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
              id="boiler-info-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Digite o fabricante'}
                          disabled={isViewMode}
                        />
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Caldeira *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={isViewMode ? '' : 'Selecione o tipo'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BoilerType.FIRE_TUBE_HORIZONTAL}>
                              Flamotubular Horizontal
                            </SelectItem>
                            <SelectItem value={BoilerType.FIRE_TUBE_VERTICAL}>
                              Flamotubular Vertical
                            </SelectItem>
                            <SelectItem
                              value={BoilerType.WATER_TUBE_HORIZONTAL}
                            >
                              Aquatubular Horizontal
                            </SelectItem>
                            <SelectItem value={BoilerType.WATER_TUBE_VERTICAL}>
                              Aquatubular Vertical
                            </SelectItem>
                            <SelectItem value={BoilerType.MIXED}>
                              Mista
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
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Digite o modelo'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearOfManufacture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano de Fabricação</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 2020'}
                          maxLength={4}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Série</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Digite a série'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumWorkingPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Máxima de Trabalho</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 10 kgf/cm²'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumOperatingPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Máxima de Operação</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={isViewMode ? '' : 'Ex: 8 kgf/cm²'}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Combustível *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isViewMode ? '' : 'Selecione o combustível'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BoilerFuelType.FIRE_WOOD}>
                              Lenha
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.WOOD_CHIPS}>
                              Cavaco de Madeira
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.BAGASSE}>
                              Bagaço
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.STRAW}>
                              Palha
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.LPG}>
                              GLP
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.NG}>
                              Gás Natural
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.DIESEL_OIL}>
                              Óleo Diesel
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.BPF_OIL}>
                              Óleo BPF
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.BLACK_LIQUOR}>
                              Licor Negro
                            </SelectItem>
                            <SelectItem value={BoilerFuelType.BRIQUETTE}>
                              Briquete
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BoilerCategory.A}>
                              Categoria A
                            </SelectItem>
                            <SelectItem value={BoilerCategory.B}>
                              Categoria B
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
        formId="boiler-info-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
