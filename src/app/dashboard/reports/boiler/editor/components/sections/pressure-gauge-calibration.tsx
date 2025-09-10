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
import { pressureGaugeQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface PressureGaugeCalibrationSectionProps {
  control: Control<any>
}

export function PressureGaugeCalibrationSection({
  control,
}: PressureGaugeCalibrationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calibração do Medidor de Pressão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="pressureGaugeTable"
          render={({ field }) => (
            <ExamsTable
              options={pressureGaugeQuestions}
              value={field.value || pressureGaugeQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="pressureGaugeCalibrationOrderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Pedido</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: PO-2024-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pressureGaugeCalibrationBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Wika" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="pressureGaugeCalibrationDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 100.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pressureGaugeCalibrationCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade (bar)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 16.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="pressureGaugeCalibrationTests"
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
          name="pressureGaugeCalibrationObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a calibração do medidor de pressão..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pressureGaugeCalibrationPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Medidor de Pressão</FormLabel>
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
