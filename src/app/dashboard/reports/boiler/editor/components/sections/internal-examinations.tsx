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
import { internExamOfEquipmentQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface InternalExaminationsSectionProps {
  control: Control<any>
}

export function InternalExaminationsSection({
  control,
}: InternalExaminationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exames Internos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="internalExaminationsTable"
          render={({ field }) => (
            <ExamsTable
              options={internExamOfEquipmentQuestions}
              value={field.value || internExamOfEquipmentQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="internalExaminationsPerformedTests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testes Realizados</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva os exames internos realizados..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="internalExaminationsPerformedObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre os exames internos..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="internalExaminationsPerformedTubes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos dos Tubos</FormLabel>
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
          name="internalExaminationsPerformedFurnace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos da Fornalha</FormLabel>
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
          name="internalExaminationsPerformedInternalBoiler"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos do Exame Interno da Caldeira</FormLabel>
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
