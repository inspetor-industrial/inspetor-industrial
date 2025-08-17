import { cn } from '@inspetor/lib/utils'
import type { ComponentProps } from 'react'

type H1Props = ComponentProps<'h1'>

export function H1({ className, ...props }: H1Props) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
        className,
      )}
      {...props}
    />
  )
}

type H2Props = ComponentProps<'h2'>

export function H2({ className, ...props }: H2Props) {
  return (
    <h2
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
      {...props}
    />
  )
}

type H3Props = ComponentProps<'h3'>

export function H3({ className, ...props }: H3Props) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

type H4Props = ComponentProps<'h4'>

export function H4({ className, ...props }: H4Props) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

type PProps = ComponentProps<'p'>

export function P({ className, ...props }: PProps) {
  return (
    <p
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    />
  )
}

type BlockquoteProps = ComponentProps<'blockquote'>

export function Blockquote({ className, ...props }: BlockquoteProps) {
  return (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  )
}

type CodeProps = ComponentProps<'code'>

export function Code({ className, ...props }: CodeProps) {
  return (
    <code
      className={cn(
        'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
      {...props}
    />
  )
}

type LeadProps = ComponentProps<'p'>

export function Lead({ className, ...props }: LeadProps) {
  return (
    <p className={cn('text-muted-foreground text-xl', className)} {...props} />
  )
}

type LargeProps = ComponentProps<'div'>

export function Large({ className, ...props }: LargeProps) {
  return <div className={cn('text-lg font-semibold', className)} {...props} />
}

type SmallProps = ComponentProps<'small'>

export function Small({ className, ...props }: SmallProps) {
  return (
    <small
      className={cn('text-sm leading-none font-medium', className)}
      {...props}
    />
  )
}

type MutedProps = ComponentProps<'p'>

export function Muted({ className, ...props }: MutedProps) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}
