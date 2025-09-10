'use client'

import { Badge } from '@inspetor/components/ui/badge'
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

interface OperatorSectionProps {
  control: Control<any>
}

export function OperatorSection({ control }: OperatorSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Dados do Operador</span>
          <Badge variant="secondary">Obrigatório</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="operatorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Operador</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome completo do operador" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="operatorNr13"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possui NR-13?</FormLabel>
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
                    <SelectItem value="INDECISO">Indeciso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo para selecionar o responsável */}
        <FormField
          control={control}
          name="engineerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela Inspeção</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Carregar usuários da empresa do usuário logado */}
                  <SelectItem value="user1">João Silva - Engenheiro</SelectItem>
                  <SelectItem value="user2">Maria Santos - Técnico</SelectItem>
                  <SelectItem value="user3">Pedro Costa - Inspetor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo condicional para certificado (quando NR-13 = Sim) */}
        {control._formValues?.operatorNr13 === 'SIM' && (
          <FormField
            control={control}
            name="operatorCertificationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado NR-13</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input {...field} placeholder="Número do certificado" />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Arraste e solte uma imagem do certificado aqui
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apenas arquivos de imagem são aceitos
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Campo condicional para providência (quando NR-13 = Não) */}
        {control._formValues?.operatorNr13 === 'NAO' && (
          <FormField
            control={control}
            name="operatorProvidence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Providência Necessária</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a providência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Operador sem curso de segurança na operação de caldeira">
                      Operador sem curso de segurança na operação de caldeira
                    </SelectItem>
                    <SelectItem value="Operador não possui grau de escolaridade necessária para função">
                      Operador não possui grau de escolaridade necessária para
                      função
                    </SelectItem>
                    <SelectItem value="Requisitos minímos do curso não atendidos. Providenciar curso para operador">
                      Requisitos minímos do curso não atendidos. Providenciar
                      curso para operador
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="operatorObservations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações do Operador</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre o operador..."
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
