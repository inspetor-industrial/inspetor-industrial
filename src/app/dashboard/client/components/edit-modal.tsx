import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateClientAction } from '@inspetor/actions/update-client'
import { Button } from '@inspetor/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@inspetor/components/ui/dialog'
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
import { brazilianStates } from '@inspetor/constants/states'
import { DocumentBRValidator, DocumentType } from '@inspetor/utils/document-br'
import type { Clients } from '@inspetor/generated/prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyName: z.string({
    message: 'Nome é obrigatório',
  }),
  taxId: z
    .string({
      message: 'CNPJ ou CPF é obrigatório',
    })
    .refine(
      (taxId) =>
        DocumentBRValidator.validate(taxId, DocumentType.CNPJ) ||
        DocumentBRValidator.validate(taxId, DocumentType.CPF),
      {
        message: 'CNPJ ou CPF inválido',
        path: ['taxId'],
      },
    )
    .transform((taxId) => {
      return taxId.replace(/[^\d]+/g, '')
    }),
  taxRegistration: z
    .string({
      message: 'Inscrição estadual é obrigatória',
    })
    .transform((taxRegistration) => {
      return taxRegistration.replace(/[^\d]+/g, '')
    }),
  state: z.string({
    message: 'Estado é obrigatório',
  }),
  city: z.string({
    message: 'Cidade é obrigatória',
  }),
  address: z.string({
    message: 'Endereço é obrigatório',
  }),
  zipCode: z.string({
    message: 'CEP é obrigatório',
  }),
  phone: z.string({
    message: 'Telefone é obrigatório',
  }),
})

type Schema = z.infer<typeof schema>

type ClientEditModalProps = {
  ref?: RefObject<any>
}

export function ClientEditModal({ ref }: ClientEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateClientAction)

  const [clientId, setClientId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      taxId: '',
      taxRegistration: '',
      state: '',
      city: '',
      address: '',
      zipCode: '',
      phone: '',
    },
  })

  const router = useRouter()

  async function handleUpdateClient(data: Schema) {
    const [result, resultError] = await action.execute({
      clientId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar cliente')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      companyName: '',
      taxId: '',
      taxRegistration: '',
      state: '',
      city: '',
      address: '',
      zipCode: '',
      phone: '',
    })

    form.setValue('companyName', '')
    form.setValue('taxId', '')
    form.setValue('taxRegistration', '')
    form.setValue('state', '')
    form.setValue('city', '')
    form.setValue('address', '')
    form.setValue('zipCode', '')
    form.setValue('phone', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (client: Clients, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setClientId(client.id)
      setIsModalOpen(true)
      form.reset({
        companyName: client.companyName,
        taxId: client.taxId,
        taxRegistration: client.taxRegistration,
        state: client.state,
        city: client.city,
        address: client.address,
        zipCode: client.zipCode,
        phone: client.phone,
      })

      form.setValue('companyName', client.companyName)
      form.setValue('taxId', client.taxId)
      form.setValue('taxRegistration', client.taxRegistration)
      form.setValue('state', client.state)
      form.setValue('city', client.city)
      form.setValue('address', client.address)
      form.setValue('zipCode', client.zipCode)
      form.setValue('phone', client.phone)
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="client-creation-form"
            onSubmit={form.handleSubmit(handleUpdateClient)}
            className="grid md:grid-cols-2 gap-4 place-content-start items-start"
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do cliente</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g pedroaba tech"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ ou CPF</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g 12345678901234"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isOnlyRead}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilianStates.map((state) => (
                          <SelectItem
                            key={state.initials}
                            value={state.initials}
                          >
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g São Paulo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g Rua das Flores"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g 12345678901234"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição estadual</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g 12345678901234"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isOnlyRead}
                      placeholder="e.g (11) 99999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="client-creation-form"
              isLoading={form.formState.isSubmitting}
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
