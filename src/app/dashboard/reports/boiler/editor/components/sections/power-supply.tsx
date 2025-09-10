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
import { powerSupplyQuestions, pumpsQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface PowerSupplySectionProps {
  control: Control<any>
}

export function PowerSupplySection({ control }: PowerSupplySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alimentação de Energia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="powerSupplyTable"
          render={({ field }) => (
            <ExamsTable
              options={powerSupplyQuestions}
              value={field.value || powerSupplyQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="pumpsTable"
          render={({ field }) => (
            <ExamsTable
              options={pumpsQuestions}
              value={field.value || pumpsQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="powerSupplyBombs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bombas</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descreva as bombas..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="powerSupplyTests"
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
          name="powerSupplyObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a alimentação de energia..."
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
