import { cn } from '@inspetor/lib/utils'
import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownProps = {
  content: string
  className?: string
}

// Custom components with better spacing for changelogs
function MarkdownH1({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-3xl font-bold tracking-tight mt-10 mb-4 first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownH2({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight mt-10 mb-4 first:mt-0 border-b pb-2',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownH3({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-3 first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownH4({ className, ...props }: ComponentProps<'h4'>) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-2 first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownH5({ className, ...props }: ComponentProps<'h5'>) {
  return (
    <h5
      className={cn(
        'scroll-m-20 text-base font-semibold tracking-tight mt-4 mb-2 first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownH6({ className, ...props }: ComponentProps<'h6'>) {
  return (
    <h6
      className={cn(
        'scroll-m-20 text-sm font-semibold tracking-tight mt-4 mb-2 first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownP({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'leading-7 text-muted-foreground mb-4 last:mb-0',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownUl({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul className={cn('my-4 ml-6 list-disc space-y-2', className)} {...props} />
  )
}

function MarkdownOl({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('my-4 ml-6 list-decimal space-y-2', className)}
      {...props}
    />
  )
}

function MarkdownLi({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn('text-muted-foreground leading-7', className)}
      {...props}
    />
  )
}

function MarkdownStrong({ className, ...props }: ComponentProps<'strong'>) {
  return (
    <strong
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function MarkdownEm({ className, ...props }: ComponentProps<'em'>) {
  return <em className={cn('italic', className)} {...props} />
}

function MarkdownBlockquote({
  className,
  ...props
}: ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className={cn(
        'mt-6 mb-6 border-l-4 border-primary/30 pl-4 py-2 italic text-muted-foreground bg-muted/30 rounded-r-md',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownCode({ className, ...props }: ComponentProps<'code'>) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm',
        className,
      )}
      {...props}
    />
  )
}

function MarkdownHr({ className, ...props }: ComponentProps<'hr'>) {
  return <hr className={cn('my-8 border-border', className)} {...props} />
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: MarkdownH1,
          h2: MarkdownH2,
          h3: MarkdownH3,
          h4: MarkdownH4,
          h5: MarkdownH5,
          h6: MarkdownH6,
          p: MarkdownP,
          ul: MarkdownUl,
          ol: MarkdownOl,
          li: MarkdownLi,
          strong: MarkdownStrong,
          em: MarkdownEm,
          blockquote: MarkdownBlockquote,
          code: MarkdownCode,
          hr: MarkdownHr,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
