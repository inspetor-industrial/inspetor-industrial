import { BoilerInfoForm } from './boiler-info-form'
import { ExternalPerformedTestsForm } from './external-performed-tests-form'
import { GeneralPerformedTestsForm } from './general-performed-tests-form'
import { InjectorGaugeForm } from './injector-gauge-form'
import { InternalPerformedTestsForm } from './internal-performed-tests-form'
import { OperatorDataForm } from './operator-data-form'
import { PowerSupplyForm } from './power-supply-form'
import { StructureMirrorInfoForm } from './sctructure-mirror-info-form'
import { StructureBodyInfoForm } from './structure-body-info-form'
import { StructureFurnaceInfoForm } from './structure-furnace-info-form'
import { StructureTubeInfoForm } from './structure-tube-info-form'

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
    'structure-body': StructureBodyInfoForm,
    'structure-tube': StructureTubeInfoForm,
    'structure-furnace': StructureFurnaceInfoForm,
    'structure-mirror': StructureMirrorInfoForm,
    injector: InjectorGaugeForm,
    'general-tests': GeneralPerformedTestsForm,
    'power-supply': PowerSupplyForm,
    'external-tests': ExternalPerformedTestsForm,
    'internal-tests': InternalPerformedTestsForm,
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
