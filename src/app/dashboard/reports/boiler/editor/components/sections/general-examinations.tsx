'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { FileUpload } from '@inspetor/components/ui/file-upload'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Textarea } from '@inspetor/components/ui/textarea'
import { tableExamsOptions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface GeneralExaminationsSectionProps {
  control: Control<any>
}

export function GeneralExaminationsSection({
  control,
}: GeneralExaminationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exames Realizados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="examsTable"
          render={({ field }) => (
            <ExamsTable
              options={tableExamsOptions}
              value={field.value || tableExamsOptions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="space-y-4">
          <FormField
            control={control}
            name="examinationsPerformedTests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testes Realizados</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descreva os testes realizados..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="examinationsPerformedObservations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Observações sobre os exames..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="examinationsPerformedRecord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto do Prontuário</FormLabel>
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
        </div>
      </CardContent>
    </Card>
  )
}
