import { cn } from '@inspetor/lib/utils'
import { type ComponentProps } from 'react'

type PageSubTitleProps = ComponentProps<'h1'>

export function PageSubTitle({ className, ...rest }: PageSubTitleProps) {
  return (
    <h2
      className={cn(
        'w-full text-left font-bold text-base sm:text-lg uppercase',
        className,
      )}
      {...rest}
    />
  )
}
