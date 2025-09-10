'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Input } from '@inspetor/components/ui/input'
import { Textarea } from '@inspetor/components/ui/textarea'
import { FileUpload } from '@inspetor/components/ui/file-upload'
import { dischargeSystemQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface BottomDischargeSystemSectionProps {
  control: Control<any>
}

export function BottomDischargeSystemSection({
  control,
}: BottomDischargeSystemSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema de Descarga de Fundo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="dischargeSystemTable"
          render={({ field }) => (
            <ExamsTable
              options={dischargeSystemQuestions}
              value={field.value || dischargeSystemQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="bottomDischargeSystemChecksTests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testes Realizados</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descreva os testes..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bottomDischargeSystemChecksObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre o sistema de descarga..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bottomDischargeSystemPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Sistema de Descarga</FormLabel>
              <FormControl>
                <FileUpload
                  files={field.value || []}
                  onChange={(files) => field.onChange(files)}
                  accept="image/*"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
