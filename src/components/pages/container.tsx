import { cn } from '@inspetor/lib/utils'
import { type ComponentProps } from 'react'

import { PageBreaker } from './breaker'

interface PageContainerProps extends ComponentProps<'div'> {
  breakPage?: boolean | null
}

export function PageContainer({
  className,
  breakPage = true,
  ...rest
}: PageContainerProps) {
  return (
    <>
      {breakPage && <PageBreaker />}
      <div
        className={cn(
          'overflow-x-hidden w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 flex flex-col justify-start items-center space-y-6 lg:space-y-8',
          className,
        )}
        {...rest}
      />
    </>
  )
}
