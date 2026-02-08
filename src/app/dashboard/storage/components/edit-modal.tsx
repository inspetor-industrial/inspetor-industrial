import { zodResolver } from '@hookform/resolvers/zod'
import { updateStorageAction } from '@inspetor/actions/update-storage'
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
} from '@inspetor/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
import type { Storage } from '@inspetor/generated/prisma/client'
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getStoragesQueryKey } from '@inspetor/hooks/use-storages-query'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
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

  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      relativeLink: '',
    },
  })

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
      await queryClient.invalidateQueries({ queryKey: getStoragesQueryKey() })
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

  const FormComponent = (
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
                <CompanySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled
                  placeholder="Selecione uma empresa"
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
  )

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

  if (isMobile) {
    return (
      <Drawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar pasta</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para editar a pasta.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                {isOnlyRead ? 'Fechar' : 'Cancelar'}
              </Button>
            </DrawerClose>

            {!isOnlyRead && (
              <Button
                type="submit"
                form="company-creation-form"
                isLoading={form.formState.isSubmitting}
              >
                Salvar
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar pasta</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar a pasta.
          </DialogDescription>
        </DialogHeader>

        {FormComponent}

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
