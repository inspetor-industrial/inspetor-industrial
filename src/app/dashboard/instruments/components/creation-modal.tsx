'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createInstrumentAction } from '@inspetor/actions/create-instrument'
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
import { MonthInput } from '@inspetor/components/ui/month-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@inspetor/components/ui/select'
import { getInstrumentsQueryKey } from '@inspetor/hooks/use-instruments-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { useSession } from '@inspetor/lib/auth/context'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
  type: z.string({
    message: 'Tipo é obrigatório',
  }),
  manufacturer: z.string({
    message: 'Fabricante é obrigatório',
  }),
  serialNumber: z.string({
    message: 'Número de série é obrigatório',
  }),
  certificateNumber: z.string({
    message: 'Número de certificado é obrigatório',
  }),
  validationDate: z.object({
    month: z.string(),
    year: z.string(),
  }),
})

type Schema = z.infer<typeof schema>

export function InstrumentCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createInstrumentAction)

  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
    },
  })

  async function handleCreateInstrument(data: Schema) {
    if (isAdmin && !data.companyId) {
      toast.error('Selecione a empresa em que o instrumento será criado')
      return
    }

    const payload =
      isAdmin && data.companyId
        ? data
        : {
            type: data.type,
            manufacturer: data.manufacturer,
            serialNumber: data.serialNumber,
            certificateNumber: data.certificateNumber,
            validationDate: data.validationDate,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao criar instrumento')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({
        queryKey: getInstrumentsQueryKey(),
      })
      form.reset({
        companyId: '',
        type: '',
        manufacturer: '',
        serialNumber: '',
        certificateNumber: '',
        validationDate: { month: '', year: '' },
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="instrument-creation-form"
        onSubmit={form.handleSubmit(handleCreateInstrument)}
        className="space-y-4"
      >
        {isAdmin && (
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard-manometer">
                      Manômetro padrão
                    </SelectItem>
                    <SelectItem value="ultrasonic-thickness-gauge">
                      Medidor de espessura Ultrassônico
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fabricante</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Pedroaba Tech"
                  aria-label="Fabricante"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de série</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 1234567890"
                  aria-label="Número de série"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certificateNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de certificado</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 1234567890"
                  aria-label="Número de certificado"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="validationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de validação</FormLabel>
              <FormControl>
                <MonthInput
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange({
                      month: value.split('/')[0],
                      year: value.split('/')[1],
                    })
                  }}
                />
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
          <Button type="button" className="w-full md:w-auto" icon={IconPlus}>
            Cadastrar instrumento
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cadastrar instrumento</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para cadastrar um novo instrumento.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button type="submit" form="instrument-creation-form">
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
        <Button type="button" className="w-full md:w-auto" icon={IconPlus}>
          Cadastrar instrumento
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar instrumento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo instrumento.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="submit"
            form="instrument-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
