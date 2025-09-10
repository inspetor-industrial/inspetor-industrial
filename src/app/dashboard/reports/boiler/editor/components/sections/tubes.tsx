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

interface TubesSectionProps {
  control: Control<any>
}

export function TubesSection({ control }: TubesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tubos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="structureTubeQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Tubos</FormLabel>
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
            name="structureTubeDiameter"
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
            name="structureTubeLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprimento dos Tubos (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 2000"
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
            name="structureTubeThickness"
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

          <FormField
            control={control}
            name="structureTubeMaterial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material dos Tubos</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ASTMA178">ASTM A178</SelectItem>
                    <SelectItem value="NOT_SPECIFIED">
                      Não Especificado
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureTubeCertificateOfManufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado do Fabricante</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número do certificado" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="structureTubeIsNaturalOrForced"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Circulação Natural ou Forçada</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Natural" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="structureQuantityOfSafetyFuse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Fusíveis de Segurança</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
