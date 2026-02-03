import { Markdown } from '@inspetor/components/markdown'
import { Badge } from '@inspetor/components/ui/badge'
import { Separator } from '@inspetor/components/ui/separator'
import { H1, P } from '@inspetor/components/ui/typography'
import { Changelog } from '@inspetor/utils/changelog'
import { CalendarIcon, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ChangelogDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ChangelogDetailPage({
  params,
}: ChangelogDetailPageProps) {
  const { slug } = await params
  const changelogs = await Changelog.getChangelogs()
  const changelog = changelogs.find((changelog) => changelog.slug === slug)

  if (!changelog) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Link
        href="/changelogs"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
      >
        <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Voltar para todos os changelogs
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono">
              v{changelog.version}
            </Badge>
            <time className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
              <CalendarIcon className="size-4" />
              {new Date(changelog.date).toLocaleDateString('pt-BR')}
            </time>
          </div>

          <H1 className="text-left text-4xl font-extrabold tracking-tight lg:text-5xl">
            {changelog.title}
          </H1>

          <P className="text-xl text-muted-foreground">
            {changelog.description}
          </P>
        </header>

        <Separator />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Markdown content={changelog.body} />
        </div>
      </article>
    </div>
  )
}
