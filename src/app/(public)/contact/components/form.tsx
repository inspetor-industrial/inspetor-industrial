'use client'

import { sendContactEmailAction } from '@inspetor/actions/send-contact-email'
import { Button } from '@inspetor/components/ui/button'
import {
  Form,
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
import { Factory, Mail, Phone, Send, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string({
    message: 'Nome é obrigatório',
  }),
  email: z
    .string({
      message: 'E-mail é obrigatório',
    })
    .email({
      message: 'E-mail inválido',
    }),
  service: z
    .enum([
      'boiler-inspection',
      'integrity-inspection',
      'pipe-inspection',
      'pressure-vessel-inspection',
      'automotive-elevator-inspection',
      'fuel-tanks-inspection',
      'safety-valve-calibration',
      'manometer-calibration',
      'others',
      '',
    ])
    .default('others'),
  description: z.string({
    message: 'Descrição é obrigatória',
  }),
  phoneNumber: z.string({
    message: 'Telefone é obrigatório',
  }),
})

type Schema = z.infer<typeof schema>

export function ContactForm() {
  const searchParams = useSearchParams()

  const action = useServerAction(sendContactEmailAction)

  const form = useForm<Schema>({
    defaultValues: {
      service: (searchParams.get('service') as Schema['service']) ?? 'others',
    },
  })

  async function handleSendContactEmail() {
    const formData = form.getValues()
    const result = schema.safeParse(formData)

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof Schema, {
          message: issue.message,
        })
      })

      return
    }

    const { description, email, name, phoneNumber, service } = formData

    try {
      const [result, resultError] = await action.execute({
        description,
        email,
        name,
        phoneNumber,
        service,
      })
      if (resultError) {
        toast.error(resultError.message)
      }
      if (result?.success) {
        toast.success(result.message)
      } else {
        toast.error(result?.message)
      }
    } catch {
      toast.error('Erro ao enviar e-mail')
    } finally {
      form.reset({
        service: (searchParams.get('service') as Schema['service']) ?? 'others',
        email: '',
        name: '',
        phoneNumber: '',
        description: '',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSendContactEmail)}
        className="grid gap-6 w-full h-full place-items-start max-sm:gap-4 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="flex items-center gap-2 text-white font-medium text-base max-sm:text-sm">
                <User className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                Nome *
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50 text-base max-sm:text-sm max-sm:h-10"
                  placeholder="Seu nome completo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="service"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem className="w-full h-full">
              <FormLabel className="flex items-center gap-2 text-white font-medium text-base max-sm:text-sm">
                <Factory className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                Serviço *
              </FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50 w-full text-base max-sm:text-sm max-sm:h-10">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent className="text-base max-sm:text-sm">
                    <SelectItem value="boiler-inspection">
                      Inspeção de Caldeiras
                    </SelectItem>
                    <SelectItem value="integrity-inspection">
                      Inspeção de Integridade
                    </SelectItem>
                    <SelectItem value="pipe-inspection">
                      Inspeção de Tubulações
                    </SelectItem>
                    <SelectItem value="pressure-vessel-inspection">
                      Inspeção de Vasos de Pressão
                    </SelectItem>
                    <SelectItem value="automotive-elevator-inspection">
                      Inspeção de Elevadores Automotivos
                    </SelectItem>
                    <SelectItem value="fuel-tanks-inspection">
                      Inspeção de Tanques de Combustível
                    </SelectItem>
                    <SelectItem value="safety-valve-calibration">
                      Calibração de Válvulas de Segurança
                    </SelectItem>
                    <SelectItem value="manometer-calibration">
                      Calibração de Manômetros
                    </SelectItem>
                    <SelectItem value="others">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem className="h-full w-full">
              <FormLabel className="flex items-center gap-2 text-white font-medium text-base max-sm:text-sm">
                <Mail className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                E-mail *
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50 text-base max-sm:text-sm max-sm:h-10"
                  placeholder="seu.email@exemplo.com"
                  {...field}
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem className="h-full w-full">
              <FormLabel className="flex items-center gap-2 text-white font-medium text-base max-sm:text-sm">
                <Phone className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                Telefone *
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50 text-base max-sm:text-sm max-sm:h-10"
                  placeholder="(11) 99999-9999"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          disabled={form.formState.isSubmitting}
          render={({ field }) => (
            <FormItem className="sm:col-span-2 h-full w-full">
              <FormLabel className="flex items-center gap-2 text-white font-medium text-base max-sm:text-sm">
                Descrição *
              </FormLabel>
              <FormControl>
                <Textarea
                  className="h-[7.6rem] bg-white/90 text-gray-900 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50 resize-none text-base max-sm:text-sm"
                  placeholder="Descreva detalhadamente sua necessidade ou dúvida sobre nossos serviços..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full flex justify-center sm:col-span-2 pt-4">
          <Button
            type="submit"
            className="w-full sm:w-48 bg-inspetor-dark-blue-700 hover:bg-inspetor-dark-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            isLoading={form.formState.isSubmitting}
            icon={Send}
            iconPosition="right"
          >
            Enviar Mensagem
          </Button>
        </div>
      </form>
    </Form>
  )
}
