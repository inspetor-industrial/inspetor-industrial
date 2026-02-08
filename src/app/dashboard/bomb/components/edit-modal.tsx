'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateBombAction } from '@inspetor/actions/update-bomb'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@inspetor/components/ui/form'
import { ImageUploadField } from '@inspetor/components/ui/image-upload-field'
import { Input } from '@inspetor/components/ui/input'
import {
  type BombListItem,
  getBombsQueryKey,
} from '@inspetor/hooks/use-bombs-query'
import { useSession } from '@inspetor/lib/auth/context'
import { useQueryClient } from '@tanstack/react-query'
import { type RefObject, useImperativeHandle, useState } from 'react'
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
  photoId: z
    .string({
      message: 'Foto é obrigatória',
    })
    .min(1, {
      message: 'Foto é obrigatória',
    }),
})

type Schema = z.infer<typeof schema>

type BombEditModalProps = {
  ref?: RefObject<{
    open: (bomb: BombListItem, isOnlyRead?: boolean) => void
    close: () => void
  } | null>
}

export function BombEditModal({ ref }: BombEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateBombAction)

  const [bombId, setBombId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)
  const [existingPhotoName, setExistingPhotoName] = useState<string | null>(
    null,
  )

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

  const queryClient = useQueryClient()

  async function handleUpdateBomb(data: Schema) {
    if (!bombId) return

    const payload =
      isAdmin && data.companyId
        ? { bombId, ...data }
        : {
            bombId,
            mark: data.mark,
            model: data.model,
            stages: data.stages,
            potency: data.potency,
            photoId: data.photoId,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao editar bomba')
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

    toast.error(result?.message ?? 'Erro ao editar bomba')
  }

  useImperativeHandle(ref, () => ({
    open: (bomb: BombListItem, isOnlyReadModal = false) => {
      setIsOnlyRead(isOnlyReadModal)
      setBombId(bomb.id)
      setExistingPhotoName(bomb.photo?.name ?? null)
      setIsModalOpen(true)
      form.reset({
        companyId: bomb.companyId ?? '',
        mark: bomb.mark,
        model: bomb.model,
        stages: bomb.stages,
        potency: String(bomb.potency),
        photoId: bomb.photoId ?? '',
      })
      form.setValue('companyId', bomb.companyId ?? '')
      form.setValue('mark', bomb.mark)
      form.setValue('model', bomb.model)
      form.setValue('stages', bomb.stages)
      form.setValue('potency', String(bomb.potency))
      form.setValue('photoId', bomb.photoId ?? '')
    },
    close: () => setIsModalOpen(false),
  }))

  const handleOpenChange = (open: boolean) => {
    if (!open && form.formState.isSubmitting) {
      return
    }
    setIsModalOpen(open)
    if (!open) {
      form.reset({
        companyId: '',
        mark: '',
        model: '',
        stages: '',
        potency: '',
        photoId: '',
      })
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOnlyRead ? 'Visualizar bomba' : 'Editar bomba'}
          </DialogTitle>
          <DialogDescription>
            {isOnlyRead
              ? 'Visualize os dados da bomba.'
              : 'Preencha os campos abaixo para editar a bomba.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="bomb-edit-form"
            onSubmit={form.handleSubmit(handleUpdateBomb)}
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
                        disabled={isOnlyRead || form.formState.isSubmitting}
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
                      disabled={isOnlyRead || form.formState.isSubmitting}
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
                      disabled={isOnlyRead || form.formState.isSubmitting}
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
                        disabled={isOnlyRead || form.formState.isSubmitting}
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
                        disabled={isOnlyRead || form.formState.isSubmitting}
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
                      value={field.value || undefined}
                      onChange={(documentId) => {
                        const newValue = documentId ?? ''
                        field.onChange(newValue)
                        if (!documentId) {
                          form.trigger('photoId')
                        }
                      }}
                      disabled={isOnlyRead || form.formState.isSubmitting}
                      existingImageName={existingPhotoName ?? undefined}
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
              {isOnlyRead ? 'Fechar' : 'Cancelar'}
            </Button>
          </DialogClose>

          {!isOnlyRead && (
            <Button
              type="submit"
              form="bomb-edit-form"
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
