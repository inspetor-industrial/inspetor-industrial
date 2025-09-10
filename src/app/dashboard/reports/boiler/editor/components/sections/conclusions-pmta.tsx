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
import { Control } from 'react-hook-form'

interface ConclusionsPmtaSectionProps {
  control: Control<any>
}

export function ConclusionsPmtaSection({
  control,
}: ConclusionsPmtaSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PMTA (Pressão Máxima de Trabalho Admissível)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="pmtaCanBeMaintained"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PMTA pode ser mantida</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SIM">Sim</SelectItem>
                  <SelectItem value="NAO">Não</SelectItem>
                  <SelectItem value="NAO_RECOMENDADO">
                    Não Recomendado
                  </SelectItem>
                  <SelectItem value="ATENCAO">Atenção</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="pmtaMustBeIncreasedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PMTA deve ser aumentada para</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 12 kgf/cm²" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pmtaMustBeDecreasedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PMTA deve ser diminuída para</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 8 kgf/cm²" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="pmtaObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações sobre PMTA</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a PMTA..."
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
