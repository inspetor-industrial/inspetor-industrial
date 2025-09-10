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

interface BodySectionProps {
  control: Control<any>
}

export function BodySection({ control }: BodySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Corpo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="structureBodyThickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura do Corpo (mm)</FormLabel>
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

          <FormField
            control={control}
            name="structureBodyDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro do Corpo (mm)</FormLabel>
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
            name="structureBodyLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprimento do Corpo (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 1500"
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
            name="structureBodyMaterial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material do Corpo</FormLabel>
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
                    <SelectItem value="ASTMA285GRC">ASTM A285 Gr C</SelectItem>
                    <SelectItem value="ASTMA516">ASTM A516</SelectItem>
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
            name="structureBodyCertificateOfManufacturer"
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
      </CardContent>
    </Card>
  )
}
