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
import { Control } from 'react-hook-form'

interface FurnaceSectionProps {
  control: Control<any>
}

export function FurnaceSection({ control }: FurnaceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fornalha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="structureFurnaceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo da Fornalha</FormLabel>
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
                    <SelectItem value="REFRACTORY">Refratária</SelectItem>
                    <SelectItem value="COOLED">Resfriada</SelectItem>
                    <SelectItem value="WATER_TUBE">Tubos de Água</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureFurnaceInfos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações da Fornalha</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Informações adicionais" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="structureFurnaceDimensionWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Largura (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 1000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureFurnaceDimensionHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureFurnaceDimensionLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprimento (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 1200"
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
            name="structureFurnaceDimensionDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureFurnaceDimensionTubeDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro dos Tubos (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureFurnaceDimensionTubeThickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura dos Tubos (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 3.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="structureFreeLengthWithoutStaysOrTube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comprimento Livre sem Estais ou Tubos</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 2.5 m" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
