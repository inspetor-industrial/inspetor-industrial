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
import { hydrostaticTestQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface HydrostaticTestSectionProps {
  control: Control<any>
}

export function HydrostaticTestSection({
  control,
}: HydrostaticTestSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste Hidrostático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="hydrostaticTestTable"
          render={({ field }) => (
            <ExamsTable
              options={hydrostaticTestQuestions}
              value={field.value || hydrostaticTestQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="hydrostaticTestPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pressão do Teste (kgf/cm²)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 15.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="hydrostaticTestDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração do Teste (minutos)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="hydrostaticTestTests"
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
          name="hydrostaticTestObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre o teste hidrostático..."
                  rows={3}
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
