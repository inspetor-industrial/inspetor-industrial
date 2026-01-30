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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Visualização do Passo {step}</h1>
      <p className="text-sm text-muted-foreground">Boiler ID: {boilerId}</p>
    </div>
  )
}
