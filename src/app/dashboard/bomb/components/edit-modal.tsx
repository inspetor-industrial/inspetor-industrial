import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateBombAction } from '@inspetor/actions/update-bomb'
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
import type { Bomb, Documents } from '@prisma/client'
import { type RefObject, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
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

type BombWithPhoto = Bomb & {
  photo: Documents
}

type BombEditModalProps = {
  ref?: RefObject<any>
}

export function BombEditModal({ ref }: BombEditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(updateBombAction)

  const [bombId, setBombId] = useState<string | null>(null)
  const [isOnlyRead, setIsOnlyRead] = useState(false)
  const [existingPhotoName, setExistingPhotoName] = useState<string | null>(
    null,
  )

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      mark: '',
      model: '',
      stages: '',
      potency: '',
      photoId: '',
    },
  })

  const router = useRouter()

  async function handleUpdateBomb(data: Schema) {
    const [result, resultError] = await action.execute({
      bombId: bombId,
      ...data,
    })

    if (resultError) {
      toast.error('Erro ao editar bomba')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }

    form.reset({
      mark: '',
      model: '',
      stages: '',
      potency: '',
      photoId: '',
    })

    setIsModalOpen(false)
  }

  useImperativeHandle(ref, () => ({
    open: (bomb: BombWithPhoto, isOnlyRead: boolean = false) => {
      setIsOnlyRead(isOnlyRead)
      setBombId(bomb.id)
      setExistingPhotoName(bomb.photo?.name ?? null)
      setIsModalOpen(true)
      form.reset({
        mark: bomb.mark,
        model: bomb.model,
        stages: bomb.stages,
        potency: String(bomb.potency),
        photoId: bomb.photoId,
      })
    },
    close: () => setIsModalOpen(false),
  }))

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                      value={field.value}
                      onChange={(documentId) =>
                        field.onChange(documentId ?? '')
                      }
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
            <Button variant="outline">
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
