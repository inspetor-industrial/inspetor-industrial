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

interface MirrorSectionProps {
  control: Control<any>
}

export function MirrorSection({ control }: MirrorSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Espelho</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="structureMirrorThickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura do Espelho (mm)</FormLabel>
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
            name="structureMirrorDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro do Espelho (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 400"
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
