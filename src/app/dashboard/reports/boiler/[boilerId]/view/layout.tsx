type BoilerViewLayoutProps = {
  children: React.ReactNode
}

export default async function BoilerViewLayout({
  children,
}: BoilerViewLayoutProps) {
  return <div>{children}</div>
}
