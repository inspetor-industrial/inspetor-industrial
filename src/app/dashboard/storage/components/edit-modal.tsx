import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { listCompanyAction } from '@inspetor/actions/list-company'
import { updateStorageAction } from '@inspetor/actions/update-storage'
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
import type { Company, Storage } from '@prisma/client'
import { type RefObject, useEffect, useImperativeHandle, useState } from 'react'
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

type StorageEditModalProps = {
  ref?: RefObject<any>
}

export function StorageEditModal({ ref }: StorageEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateStorageAction)

  const [storageId, setStorageId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)

  const [companies, setCompanies] = useState<Company[]>([])
  const listCompanies = useServerAction(listCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      relativeLink: '',
    },
  })

  const router = useRouter()

  async function handleUpdateCompany(data: Schema) {
    const [result, resultError] = await action.execute({
      storageId: storageId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar pasta')
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

  useImperativeHandle(ref, () => ({
    open: (storage: Storage, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setStorageId(storage.id)
      setIsModalOpen(true)
      form.reset({
        companyId: storage.companyId,
        relativeLink: storage.relativeLink,
      })

      form.setValue('companyId', storage.companyId)
      form.setValue('relativeLink', storage.relativeLink)
    },
    close: () => setIsModalOpen(false),
  }))

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar pasta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a pasta.
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
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relativeLink"
              render={({ field }) => {
                let value = field.value
                if (
                  !value.includes('https://drive.google.com/drive/folders') &&
                  value
                ) {
                  value = `https://drive.google.com/drive/folders${field.value}`
                }

                return (
                  <FormItem>
                    <FormLabel>Link para a pasta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={value}
                        placeholder="e.g https://drive.google.com/drive/folders/pedroaba-tech"
                        disabled={isOnlyRead || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
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
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
