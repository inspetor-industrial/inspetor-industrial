import { BoilerViewStepsClient } from './components/boiler-view-steps-client'

type BoilerViewStepsPageProps = {
  params: Promise<{
    boilerId: string
    step: string
  }>
}

export default async function BoilerViewStepsPage({
  params,
}: BoilerViewStepsPageProps) {
  const { boilerId, step } = await params

  return <BoilerViewStepsClient boilerId={boilerId} stepId={step} />
}
