import { cn } from '@inspetor/lib/utils'
import { type ComponentProps } from 'react'

type PageTitleProps = ComponentProps<'h1'>

export function PageTitle({ className, ...rest }: PageTitleProps) {
  return (
    <h1
      className={cn(
        'w-full bg-insp-blue/75 text-center font-bold text-base sm:text-lg lg:text-xl uppercase underline py-0.5 px-2',
        className,
      )}
      {...rest}
    />
  )
}
