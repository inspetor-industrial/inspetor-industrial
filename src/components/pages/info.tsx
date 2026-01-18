import { cn } from '@inspetor/lib/utils'
import { type ComponentProps } from 'react'

type PageInfoContainerProps = ComponentProps<'div'>

export function PageInfoContainer({
  className,
  ...rest
}: PageInfoContainerProps) {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-start justify-start gap-px',
        className,
      )}
      {...rest}
    />
  )
}
