'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { getOperatorByBoilerReportIdAction } from '@inspetor/actions/boiler/operator/get-operator-by-boiler-report-id'
import { upsertOperatorAction } from '@inspetor/actions/boiler/operator/upsert-operator'
import { Card, CardContent } from '@inspetor/components/ui/card'
import { Checkbox } from '@inspetor/components/ui/checkbox'
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
import { Label } from '@inspetor/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Textarea } from '@inspetor/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormToolbar } from '../components/form-toolbar'

const operatorDataSchema = z
  .object({
    operatorName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    isAbleToOperateWithNR13: z.string().min(1, 'Campo obrigatório'),
    certificateDocumentId: z.string().optional(),
    provisionsForOperator: z.string().optional(),
    observations: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isAbleToOperateWithNR13 === 'yes') {
        return (
          !!data.certificateDocumentId &&
          data.certificateDocumentId.trim() !== ''
        )
      }
      return true
    },
    {
      message: 'Certificado é obrigatório quando o operador está apto com NR13',
      path: ['certificateDocumentId'],
    },
  )
  .refine(
    (data) => {
      if (data.isAbleToOperateWithNR13 === 'no') {
        return (
          !!data.provisionsForOperator &&
          data.provisionsForOperator.trim() !== ''
        )
      }
      return true
    },
    {
      message:
        'Providências são obrigatórias quando o operador não está apto com NR13',
      path: ['provisionsForOperator'],
    },
  )

type OperatorDataFormValues = z.infer<typeof operatorDataSchema>

type OperatorDataFormProps = {
  boilerId: string
  action?: 'view' | 'edit'
}

export function OperatorDataForm({
  boilerId,
  action = 'view',
}: OperatorDataFormProps) {
  const router = useRouter()
  const isViewMode = action === 'view'
  const [existingCertificateName, setExistingCertificateName] = useState<
    string | null
  >(null)

  const form = useForm<OperatorDataFormValues>({
    resolver: zodResolver(operatorDataSchema),
    defaultValues: {
      operatorName: '',
      isAbleToOperateWithNR13: '',
      certificateDocumentId: undefined,
      provisionsForOperator: '',
      observations: '',
    },
  })

  useEffect(() => {
    const loadOperatorData = async () => {
      try {
        const [result] = await getOperatorByBoilerReportIdAction({
          boilerReportId: boilerId,
        })

        if (result.success && result.others?.data) {
          const operator = result.others.data
          setExistingCertificateName(
            operator.certificate?.document?.name || null,
          )
          form.reset({
            operatorName: operator.name,
            isAbleToOperateWithNR13: operator.isAbleToOperateWithNR13,
            certificateDocumentId:
              operator.certificate?.documentId || undefined,
            provisionsForOperator: operator.provisionsForOperator || '',
            observations: operator.observations || '',
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados do operador:', error)
      }
    }

    loadOperatorData()
  }, [boilerId, form])

  const isAbleToOperateWithNR13 = useWatch({
    control: form.control,
    name: 'isAbleToOperateWithNR13',
  })

  useEffect(() => {
    if (isAbleToOperateWithNR13 === 'yes') {
      form.setValue('provisionsForOperator', '')
      form.clearErrors('provisionsForOperator')
    } else if (isAbleToOperateWithNR13 === 'no') {
      form.setValue('certificateDocumentId', undefined)
      form.clearErrors('certificateDocumentId')
    }
  }, [isAbleToOperateWithNR13, form])

  const onSubmit = async (data: OperatorDataFormValues) => {
    try {
      const [result] = await upsertOperatorAction({
        boilerReportId: boilerId,
        name: data.operatorName,
        isAbleToOperateWithNR13: data.isAbleToOperateWithNR13,
        certificateId:
          data.certificateDocumentId && data.certificateDocumentId.trim() !== ''
            ? data.certificateDocumentId
            : null,
        provisionsForOperator:
          data.provisionsForOperator && data.provisionsForOperator.trim() !== ''
            ? data.provisionsForOperator
            : null,
        observations: data.observations || null,
      })

      if (result.success) {
        toast.success(result.message)
        router.push(`/dashboard/reports/boiler/${boilerId}/view`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar dados do operador:', error)
      toast.error('Erro ao salvar dados do operador')
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
              id="operator-data-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operatorName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome do operador *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome completo do operador"
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAbleToOperateWithNR13"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Operador se enquadra na NR13? *</FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value === 'yes'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'yes' : '')
                              }}
                              id="option-yes"
                              disabled={isViewMode}
                            />
                            <Label htmlFor="option-yes" className="text-sm">
                              SIM
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value === 'no'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'no' : '')
                              }}
                              id="option-no"
                              disabled={isViewMode}
                            />
                            <Label htmlFor="option-no" className="text-sm">
                              NÃO
                            </Label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAbleToOperateWithNR13 === 'yes' && (
                  <FormField
                    control={form.control}
                    name="certificateDocumentId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Certificado do operador *</FormLabel>
                        <FormControl>
                          <ImageUploadField
                            value={field.value}
                            onChange={field.onChange}
                            disabled={form.formState.isSubmitting || isViewMode}
                            existingImageName={
                              existingCertificateName || undefined
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isAbleToOperateWithNR13 === 'no' && (
                  <FormField
                    control={form.control}
                    name="provisionsForOperator"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>
                          Providências necessárias para o operador
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isViewMode}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operador sem curso de segurança na operação de caldeira">
                                Operador sem curso de segurança na operação de
                                caldeira
                              </SelectItem>
                              <SelectItem value="Operador não possui grau de escolaridade necessária para função">
                                Operador não possui grau de escolaridade
                                necessária para função
                              </SelectItem>
                              <SelectItem value="Requisitos minímos do curso não atendidos. Providenciar curso para operador">
                                Requisitos minímos do curso não atendidos.
                                Providenciar curso para operador
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Digite observações adicionais (opcional)"
                          rows={4}
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
        formId="operator-data-form"
        onBack={handleBack}
        onCancel={handleCancel}
        isSaving={form.formState.isSubmitting}
        isViewMode={isViewMode}
      />
    </>
  )
}
