import { Badge } from '@inspetor/components/ui/badge'
import { Separator } from '@inspetor/components/ui/separator'
import { H1, H3, P } from '@inspetor/components/ui/typography'
import { Changelog } from '@inspetor/utils/changelog'
import { CalendarIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function ChangelogsPage() {
  const changelogs = await Changelog.getChangelogs()

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="space-y-4 mb-16 text-center">
        <H1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          O que há de novo
        </H1>
        <P className="text-xl text-muted-foreground">
          Acompanhe as últimas atualizações, melhorias e correções do Inspetor
          Industrial.
        </P>
      </div>

      <div className="relative space-y-16 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {changelogs.map((log) => (
          <div
            key={log.version}
            className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Dot: centered vertically with the card */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 self-center md:order-1 md:group-odd:-translate-x-[calc(50%-3px)] md:group-even:translate-x-[calc(50%-3px)]">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>

            {/* Content Card */}
            <Link
              href={`/changelogs/${log.slug}`}
              className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50 group/card"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="font-mono">
                  v{log.version}
                </Badge>
                <time className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <CalendarIcon className="size-3" />
                  {new Date(log.date).toLocaleDateString('pt-BR')}
                </time>
              </div>

              <div className="flex items-start justify-between gap-2">
                <H3 className="mb-2 group-hover/card:text-primary transition-colors">
                  {log.title}
                </H3>
                <ChevronRight className="size-5 text-muted-foreground group-hover/card:text-primary transition-all group-hover/card:translate-x-1" />
              </div>

              <P className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {log.description}
              </P>

              <Separator className="my-4" />

              <div className="text-xs font-medium text-primary flex items-center gap-1">
                Ver detalhes completos
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
