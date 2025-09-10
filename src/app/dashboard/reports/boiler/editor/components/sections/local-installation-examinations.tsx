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
import { Textarea } from '@inspetor/components/ui/textarea'
import { FileUpload } from '@inspetor/components/ui/file-upload'
import { questionsAboutInstallationLocal } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface LocalInstallationExaminationsSectionProps {
  control: Control<any>
}

export function LocalInstallationExaminationsSection({
  control,
}: LocalInstallationExaminationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exames de Instalação Local</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="localInstallationTable"
          render={({ field }) => (
            <ExamsTable
              options={questionsAboutInstallationLocal}
              value={field.value || questionsAboutInstallationLocal}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="localInstallationExaminationsPerformedTests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testes Realizados</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva os exames de instalação local..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="localInstallationExaminationsPerformedObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre os exames de instalação..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="localInstallationExaminationsPerformedBoilerHouse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fotos do Local de Instalação</FormLabel>
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
