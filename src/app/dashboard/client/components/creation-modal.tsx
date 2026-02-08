import { zodResolver } from '@hookform/resolvers/zod'
import { createClientAction } from '@inspetor/actions/create-client'
import { CompanySelect } from '@inspetor/components/company-select'
import { Button } from '@inspetor/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@inspetor/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@inspetor/components/ui/drawer'
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
import { getClientQueryKey } from '@inspetor/hooks/use-client-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useSession } from '@inspetor/lib/auth/context'
import { DocumentBRValidator, DocumentType } from '@inspetor/utils/document-br'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
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

export function ClientCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createClientAction)

  const queryClient = useQueryClient()

  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const isMobile = useIsMobile()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
    },
  })

  async function handleCreateCompany(data: Schema) {
    if (isAdmin && !data.companyId) {
      toast.error('Selecione a empresa em que o cliente será criado')
      return
    }

    const payload =
      isAdmin && data.companyId ? data : { ...data, companyId: undefined }
    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao criar cliente')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getClientQueryKey() })
    } else {
      toast.error(result?.message)
    }

    form.reset({
      companyId: '',
      companyName: '',
      taxId: '',
      taxRegistration: '',
      state: '',
      city: '',
      address: '',
      zipCode: '',
      phone: '',
    })

    form.setValue('companyId', '')
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

  const FormComponent = (
    <Form {...form}>
      <form
        id="client-creation-form"
        onSubmit={form.handleSubmit(handleCreateCompany)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 place-content-start items-start"
      >
        {isAdmin && (
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <CompanySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecione a empresa"
                    label="Empresa"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do cliente</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g pedroaba tech" />
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
                <Input {...field} placeholder="e.g 12345678901234" />
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
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.initials} value={state.initials}>
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
                <Input {...field} placeholder="e.g São Paulo" />
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
                <Input {...field} placeholder="e.g Rua das Flores" />
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
                <Input {...field} placeholder="e.g 12345678901234" />
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
                <Input {...field} placeholder="e.g 12345678901234" />
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
                <Input {...field} placeholder="e.g (11) 99999-9999" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerTrigger asChild>
          <Button icon={IconPlus}>Cadastrar cliente</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cadastrar cliente</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para cadastrar um novo cliente.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button type="submit" form="client-creation-form">
              Cadastrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Cadastrar cliente</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar cliente</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo cliente.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="client-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
