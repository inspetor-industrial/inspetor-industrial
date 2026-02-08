'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createValveAction } from '@inspetor/actions/create-valve'
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
import { useIsMobile } from '@inspetor/hooks/use-mobile'
import { getValvesQueryKey } from '@inspetor/hooks/use-valves-query'
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
  serialNumber: z.string({
    message: 'Número de série é obrigatório',
  }),
  model: z.string({
    message: 'Modelo é obrigatório',
  }),
  diameter: z.string({
    message: 'Diâmetro é obrigatório',
  }),
  flow: z.string({
    message: 'Vazão é obrigatória',
  }),
  openingPressure: z.string({
    message: 'Pressão de abertura é obrigatória',
  }),
  closingPressure: z.string({
    message: 'Pressão de fechamento é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

export function ValveCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const action = useServerAction(createValveAction)

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

  async function handleCreateValve(data: Schema) {
    if (isAdmin && !data.companyId) {
      toast.error('Selecione a empresa em que a válvula será criada')
      return
    }

    const payload =
      isAdmin && data.companyId
        ? data
        : {
            serialNumber: data.serialNumber,
            model: data.model,
            diameter: data.diameter,
            flow: data.flow,
            openingPressure: data.openingPressure,
            closingPressure: data.closingPressure,
          }

    const [result, resultError] = await action.execute(payload)

    if (resultError) {
      toast.error('Erro ao criar válvula')
      return
    }

    if (result?.success) {
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: getValvesQueryKey() })
      form.reset({
        companyId: '',
        serialNumber: '',
        model: '',
        diameter: '',
        flow: '',
        openingPressure: '',
        closingPressure: '',
      })
      setIsModalOpen(false)
      return
    }

    toast.error(result?.message)
  }

  const FormComponent = (
    <Form {...form}>
      <form
        id="valve-creation-form"
        onSubmit={form.handleSubmit(handleCreateValve)}
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
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de série</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. VSN-123456"
                  aria-label="Número de série"
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
                  placeholder="e.g. VLV-2000"
                  aria-label="Modelo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="diameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro (mm)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50.00"
                    aria-label="Diâmetro"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="flow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vazão (m3/h)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 100.00"
                    aria-label="Vazão"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openingPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pressão de abertura (bar)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.00"
                    aria-label="Pressão de abertura"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="closingPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pressão de fechamento (bar)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.00"
                    aria-label="Pressão de fechamento"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
            Cadastrar válvula
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cadastrar válvula</DrawerTitle>
            <DrawerDescription>
              Preencha os campos abaixo para cadastrar uma nova válvula.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">{FormComponent}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>

            <Button type="submit" form="valve-creation-form">
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
          Cadastrar válvula
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar válvula</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar uma nova válvula.
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
            form="valve-creation-form"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
