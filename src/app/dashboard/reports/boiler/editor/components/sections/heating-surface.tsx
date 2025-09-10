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
import { Control } from 'react-hook-form'

interface HeatingSurfaceSectionProps {
  control: Control<any>
}

export function HeatingSurfaceSection({ control }: HeatingSurfaceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Superfície de Aquecimento</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="structureHeatingSurface"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Superfície de Aquecimento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 50 m²" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
