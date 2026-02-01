import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelogs | Inspetor Industrial',
  description:
    'Acompanhe as últimas atualizações e novidades do Inspetor Industrial.',
}

export default function ChangelogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Inspetor Industrial
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Changelog
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Voltar para o Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t py-12">
        <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Inspetor Industrial. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
