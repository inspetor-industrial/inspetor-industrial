type BoilerViewStepsLayoutProps = {
  children: React.ReactNode
  forms: React.ReactNode
}

export default async function BoilerViewStepsLayout({
  children,
  forms,
}: BoilerViewStepsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen space-y-6">
      {children}
      {forms}
    </div>
  )
}
