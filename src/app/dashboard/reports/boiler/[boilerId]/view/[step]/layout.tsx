type BoilerViewStepsLayoutProps = {
  children: React.ReactNode
  forms: React.ReactNode
}

export default async function BoilerViewStepsLayout({
  children,
  forms,
}: BoilerViewStepsLayoutProps) {
  return (
    <div className="bg-background pt-4 sm:pt-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {children}
        {forms}
      </div>
    </div>
  )
}
