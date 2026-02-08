'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createBombAction } from '@inspetor/actions/create-bomb'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { ImageUploadField } from '@inspetor/components/ui/image-upload-field'
import { Input } from '@inspetor/components/ui/input'
import { getBombsQueryKey } from '@inspetor/hooks/use-bombs-query'
import { useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  companyId: z.string().optional(),
  mark: z.string({
    message: 'Marca é obrigatória',
  }),
  model: z.string({
    message: 'Modelo é obrigatório',
  }),
  stages: z.string({
    message: 'Estágios é obrigatório',
  }),
  potency: z.string({
    message: 'Potência é obrigatória',
  }),
  photoId: z.string({
    message: 'Foto é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

export function BombCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createBombAction)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      mark: '',
      model: '',
      stages: '',
      potency: '',
      photoId: '',
    },
  })

  async function handleCreateBomb(data: Schema) {
    if (isAdmin && !data.companyId) {
      toast.error('Selecione a empresa em que a bomba será criada')
      return
    }

    const payload =
      isAdmin && data.companyId
        ? data
        : {
            mark: data.mark,
            model: data.model,
            stages: data.stages,
            potency: data.potency,
            photoId: data.photoId,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao criar bomba')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getBombsQueryKey() })
      form.reset({
        companyId: '',
        mark: '',
        model: '',
        stages: '',
        potency: '',
        photoId: '',
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button type="button" icon={IconPlus}>
          Cadastrar bomba
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar bomba</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar uma nova bomba.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="bomb-creation-form"
            onSubmit={form.handleSubmit(handleCreateBomb)}
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
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        placeholder="Selecione a empresa"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="mark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. KSB"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Meganorm"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágios</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 2"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="potency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potência (CV)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10.00"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto da Bomba</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={(documentId) => field.onChange(documentId ?? '')}
                      disabled={form.formState.isSubmitting}
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
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="submit"
            form="bomb-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
