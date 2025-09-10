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
import { securityMeasurementContinuationValve } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface SafetyValveGaugeSectionProps {
  control: Control<any>
}

export function SafetyValveGaugeSection({
  control,
}: SafetyValveGaugeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medidor de Válvula de Segurança</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="safetyValveTable"
          render={({ field }) => (
            <ExamsTable
              options={securityMeasurementContinuationValve}
              value={field.value || securityMeasurementContinuationValve}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="safetyValveGaugeQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="safetyValveGaugeValves"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Válvulas</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Descreva as válvulas..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="safetyValveGaugeIsThereSafetyValveRedundancy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Há Redundância de Válvula de Segurança?</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Sim" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="safetyValveGaugeObservations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Observações sobre as válvulas de segurança..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="safetyValvePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto da Válvula de Segurança</FormLabel>
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
