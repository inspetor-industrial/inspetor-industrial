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
import { tableExternExamsQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface ExternalExaminationsSectionProps {
  control: Control<any>
}

export function ExternalExaminationsSection({
  control,
}: ExternalExaminationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exames Externos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="externalExaminationsTable"
          render={({ field }) => (
            <ExamsTable
              options={tableExternExamsQuestions}
              value={field.value || tableExternExamsQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="externalExaminationsPerformedTests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testes Realizados</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva os exames externos realizados..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="externalExaminationsPerformedObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre os exames externos..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="externalExaminationsPerformedPlateIdentification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto da Placa de Identificação</FormLabel>
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

        <FormField
          control={control}
          name="externalExaminationsPerformedBoiler"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto da Caldeira</FormLabel>
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
