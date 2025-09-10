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
import { Input } from '@inspetor/components/ui/input'
import { Textarea } from '@inspetor/components/ui/textarea'
import { waterQualityQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface WaterQualitySectionProps {
  control: Control<any>
}

export function WaterQualitySection({ control }: WaterQualitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualidade da Água</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="waterQualityTable"
          render={({ field }) => (
            <ExamsTable
              options={waterQualityQuestions}
              value={field.value || waterQualityQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="waterQualityTests"
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
            name="waterQualityPh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>pH da Água</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 7.2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="waterQualityObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a qualidade da água..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="waterQualityPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto da Qualidade da Água</FormLabel>
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
