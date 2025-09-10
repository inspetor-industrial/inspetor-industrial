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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { Control } from 'react-hook-form'

interface UltrasoundExamASectionProps {
  control: Control<any>
}

export function UltrasoundExamASection({
  control,
}: UltrasoundExamASectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exame A - Ultrassom</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationATotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura Total (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationAMean"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura Média (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 8.2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationAThicknessProvidedByManufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura do Fabricante (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 10.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationACorrosionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Corrosão (mm/ano)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.001"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationAAllowableThickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura Admissível (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 6.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ultrasoundTestsBodyExaminationAIsRegularizedAccordingToASME1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regularizado conforme ASME</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SIM">Sim</SelectItem>
                    <SelectItem value="NAO">Não</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="ultrasoundTestsBodyExaminationAPhoto"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Foto do Exame A</FormLabel>
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
