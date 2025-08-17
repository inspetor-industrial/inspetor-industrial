import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { listCompanyAction } from '@inspetor/actions/list-company'
import { registerStorageAction } from '@inspetor/actions/register-storage'
import { Button } from '@inspetor/components/ui/button'
import { Combobox } from '@inspetor/components/ui/combobox'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { Input } from '@inspetor/components/ui/input'
import type { Company } from '@prisma/client'
import { IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string({
    message: 'Empresa é obrigatória',
  }),
  relativeLink: z.string({
    message: 'Link para a pasta é obrigatório',
  }),
})

type Schema = z.infer<typeof schema>

export function StorageCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  const action = useServerAction(registerStorageAction)
  const listCompanies = useServerAction(listCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleRegisterStorage(data: Schema) {
    const [result, resultError] = await action.execute(data)

    if (resultError) {
      toast.error('Erro ao registrar pasta')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      companyId: '',
      relativeLink: '',
    })

    form.setValue('companyId', '')
    form.setValue('relativeLink', '')

    setIsModalOpen(false)
  }

  useEffect(() => {
    async function fetchCompanies() {
      const [result, resultError] = await listCompanies.execute()

      if (resultError) {
        toast.error('Erro ao listar empresas')
      }

      if (result?.success) {
        setCompanies(result.others.companies)
      }
    }

    fetchCompanies()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button icon={IconPlus}>Registrar pasta</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pasta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para registrar uma nova pasta.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="company-creation-form"
            onSubmit={form.handleSubmit(handleRegisterStorage)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Combobox
                      options={companies.map((company) => ({
                        id: company.id,
                        value: company.name.toLowerCase(),
                        label: company.name,
                      }))}
                      placeholder="Selecione uma empresa"
                      label="Empresa"
                      isLoading={listCompanies.isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relativeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link para a pasta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g /pedroaba-tech" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="company-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Registrar pasta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
