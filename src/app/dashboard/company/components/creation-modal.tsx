'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createCompanyAction } from '@inspetor/actions/create-company'
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
import { getCompaniesQueryKey } from '@inspetor/hooks/use-companies-query'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { DocumentBRValidator, DocumentType } from '@inspetor/utils/document-br'
import { IconPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string({
    message: 'Nome é obrigatório',
  }),
  cnpj: z
    .string({
      message: 'CNPJ é obrigatório',
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
})

type Schema = z.infer<typeof schema>

export function CompanyCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createCompanyAction)
  const queryClient = useQueryClient()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const isMobile = useIsMobile()

  async function handleCreateCompany(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      toast.error('Erro ao criar empresa')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getCompaniesQueryKey() })
      form.reset({ name: '', cnpj: '' })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="company-creation-form"
        onSubmit={form.handleSubmit(handleCreateCompany)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Pedroaba Tech"
                  aria-label="Nome da empresa"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 12345678901234"
                  aria-label="CNPJ da empresa"
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
          <Button type="button" icon={IconPlus}>
            Cadastrar empresa
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cadastrar empresa</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para cadastrar uma nova empresa.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button type="submit" form="company-creation-form">
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
        <Button type="button" icon={IconPlus}>
          Cadastrar empresa
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar empresa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar uma nova empresa.
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
            form="company-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
