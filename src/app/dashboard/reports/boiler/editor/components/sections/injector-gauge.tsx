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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Textarea } from '@inspetor/components/ui/textarea'
import { FileUpload } from '@inspetor/components/ui/file-upload'
import { injectorQuestions } from '@inspetor/constants/tests'
import { Control } from 'react-hook-form'

import { ExamsTable } from '../exams-table'

interface InjectorGaugeSectionProps {
  control: Control<any>
}

export function InjectorGaugeSection({ control }: InjectorGaugeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medidor de Injetor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="injectorTable"
          render={({ field }) => (
            <ExamsTable
              options={injectorQuestions}
              value={field.value || injectorQuestions}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="injectorGaugeSerialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: SN123456" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="injectorGaugeMark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Honeywell" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="injectorGaugeDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 25.4"
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
            name="injectorGaugeFuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Combustível</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LIQUID">Líquido</SelectItem>
                    <SelectItem value="GASEOUS">Gasoso</SelectItem>
                    <SelectItem value="SOLID">Sólido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="injectorGaugeTests"
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
          name="injectorGaugeObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre o medidor de injetor..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="injectorPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Injetor</FormLabel>
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
