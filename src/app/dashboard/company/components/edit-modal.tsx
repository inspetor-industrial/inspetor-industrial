import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCompanyAction } from '@inspetor/actions/update-company'
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
import type { Company } from '@prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z.string({
    message: 'Nome é obrigatório',
  }),
  cnpj: z.string({
    message: 'CNPJ é obrigatório',
  }),
})

type Schema = z.infer<typeof schema>

type CompanyEditModalProps = {
  ref?: RefObject<any>
}

export function CompanyEditModal({ ref }: CompanyEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateCompanyAction)

  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cnpj: '',
    },
  })

  const router = useRouter()

  async function handleUpdateCompany(data: Schema) {
    const [result, resultError] = await action.execute({
      companyId: companyId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao criar empresa')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      name: '',
      cnpj: '',
    })

    form.setValue('name', '')
    form.setValue('cnpj', '')

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (company: Company, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setCompanyId(company.id)
      setIsModalOpen(true)
      form.reset({
        name: company.name,
        cnpj: company.cnpj,
      })

      form.setValue('name', company.name)
      form.setValue('cnpj', company.cnpj)
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar empresa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a empresa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="company-creation-form"
            onSubmit={form.handleSubmit(handleUpdateCompany)}
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
                      placeholder="e.g pedroaba tech"
                      disabled={isOnlyRead || form.formState.isSubmitting}
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
                      placeholder="e.g 12345678901234"
                      disabled={isOnlyRead || form.formState.isSubmitting}
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
              form="company-creation-form"
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
