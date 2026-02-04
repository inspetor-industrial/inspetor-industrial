import { BoilerInfoForm } from './boiler-info-form'
import { OperatorDataForm } from './operator-data-form'

type BoilerViewformStepssPageProps = {
  params: Promise<{
    boilerId: string
    step: string
  }>
  searchParams: Promise<{
    action?: 'view' | 'edit'
  }>
}

export default async function BoilerViewformStepssPage({
  params,
  searchParams,
}: BoilerViewformStepssPageProps) {
  const { boilerId, step } = await params
  const { action = 'view' } = await searchParams

  const formComponents: Record<
    string,
    React.ComponentType<{ boilerId: string; action?: 'view' | 'edit' }>
  > = {
    'operator-data': OperatorDataForm,
    'boiler-info': BoilerInfoForm,
  }

  const FormComponent = formComponents[step]

  if (!FormComponent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg text-muted-foreground">
          Formulário em desenvolvimento
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Este formulário ainda não foi implementado. Etapa: {step}
        </p>
      </div>
    )
  }

  return <FormComponent boilerId={boilerId} action={action} />
}
