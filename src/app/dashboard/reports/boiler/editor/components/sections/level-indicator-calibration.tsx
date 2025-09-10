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
import { levelIndicatorQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface LevelIndicatorCalibrationSectionProps {
  control: Control<any>
}

export function LevelIndicatorCalibrationSection({
  control,
}: LevelIndicatorCalibrationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calibração do Indicador de Nível</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="levelIndicatorTable"
          render={({ field }) => (
            <ExamsTable
              options={levelIndicatorQuestions}
              value={field.value || levelIndicatorQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="calibrationOfTheLevelIndicatorAssemblyMark"
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

          <FormField
            control={control}
            name="calibrationOfTheLevelIndicatorAssemblyGlassDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro do Vidro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 20.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="calibrationOfTheLevelIndicatorAssemblyGlassLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprimento do Vidro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="calibrationOfTheLevelIndicatorAssemblyTests"
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
        </div>

        <FormField
          control={control}
          name="calibrationOfTheLevelIndicatorAssemblyObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a calibração..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="levelIndicatorPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Indicador de Nível</FormLabel>
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
