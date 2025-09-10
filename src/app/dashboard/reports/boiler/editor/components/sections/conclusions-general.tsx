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

interface ConclusionsGeneralSectionProps {
  control: Control<any>
}

export function ConclusionsGeneralSection({
  control,
}: ConclusionsGeneralSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conclusões Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="conclusionsNrItemsThatNotBeingMet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Itens desta NR que não estão sendo atendidos
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Liste os itens que não estão sendo atendidos..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conclusionsImmediateMeasuresNecessary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Providências Imediatas Necessárias</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva as providências imediatas necessárias..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conclusionsNecessaryRecommendations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recomendações Necessárias</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Liste as recomendações necessárias..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="conclusionsDeadlineForNextInspection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo para Próxima Inspeção</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 12 meses" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="conclusionsCanBeOperateNormally"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  A caldeira pode ser utilizada normalmente?
                </FormLabel>
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
        </div>
      </CardContent>
    </Card>
  )
}
