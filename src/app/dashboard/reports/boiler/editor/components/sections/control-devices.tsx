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
import { electricalControlQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface ControlDevicesSectionProps {
  control: Control<any>
}

export function ControlDevicesSection({ control }: ControlDevicesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispositivos de Controle Elétrico/Eletrônico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="electricalControlTable"
          render={({ field }) => (
            <ExamsTable
              options={electricalControlQuestions}
              value={field.value || electricalControlQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="gaugeOfElectricOrElectronicControlDevicesAndCommandsTests"
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
          name="gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre os dispositivos de controle..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="controlDevicesPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto dos Dispositivos de Controle</FormLabel>
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
