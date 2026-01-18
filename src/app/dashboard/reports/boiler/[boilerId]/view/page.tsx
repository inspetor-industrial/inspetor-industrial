type BoilerViewPageProps = {
  params: Promise<{
    boilerId: string
  }>
}

export default async function BoilerViewPage({ params }: BoilerViewPageProps) {
  return (
    <div>
      <h1>Boiler View</h1>
    </div>
  )
}
