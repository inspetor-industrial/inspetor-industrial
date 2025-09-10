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

interface BoilerSectionProps {
  control: Control<any>
}

export function BoilerSection({ control }: BoilerSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Caldeira</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="boilerManufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do fabricante" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="boilerBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Marca da caldeira" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="boilerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo da Caldeira</FormLabel>
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
                    <SelectItem value="FIRE_TUBE_HORIZONTAL">
                      Tubos de Fogo Horizontal
                    </SelectItem>
                    <SelectItem value="FIRE_TUBE_VERTICAL">
                      Tubos de Fogo Vertical
                    </SelectItem>
                    <SelectItem value="WATER_TUBE_HORIZONTAL">
                      Tubos de Água Horizontal
                    </SelectItem>
                    <SelectItem value="WATER_TUBE_VERTICAL">
                      Tubos de Água Vertical
                    </SelectItem>
                    <SelectItem value="MIXED">Mista</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="boilerModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Modelo da caldeira" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="boilerManufacturerYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano de Fabricação</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 2020" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="boilerCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade (kg/h)</FormLabel>
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
            name="boilerSerie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Série</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número da série" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="boilerMaxPressureWorkable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pressão Máxima de Trabalho (kgf/cm²)</FormLabel>
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
            name="boilerPressureOperating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pressão de Operação (kgf/cm²)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 8.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="boilerFuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Combustível</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o combustível" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIRE_WOOD">Lenha</SelectItem>
                    <SelectItem value="WOOD_CHIPS">
                      Cavaco de Madeira
                    </SelectItem>
                    <SelectItem value="BAGASSE">Bagaço</SelectItem>
                    <SelectItem value="STRAW">Palha</SelectItem>
                    <SelectItem value="LPG">GLP</SelectItem>
                    <SelectItem value="NG">Gás Natural</SelectItem>
                    <SelectItem value="DIESEL_OIL">Óleo Diesel</SelectItem>
                    <SelectItem value="BPF_OIL">Óleo BPF</SelectItem>
                    <SelectItem value="BLACK_LIQUOR">Licor Negro</SelectItem>
                    <SelectItem value="BRIQUETTE">Briquete</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="boilerCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria da Caldeira</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">Categoria A</SelectItem>
                  <SelectItem value="B">Categoria B</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
