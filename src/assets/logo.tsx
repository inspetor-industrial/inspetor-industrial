import { cn } from '@inspetor/lib/utils'
import Image from 'next/image'
import type { ComponentProps } from 'react'

import InspetorLogoPNG from './raw/inspetor-logo.png'

export type InspetorLogoProps = Omit<
  ComponentProps<typeof Image>,
  'src' | 'alt'
>

export function InspetorLogo({ className, ...props }: InspetorLogoProps) {
  return (
    <Image
      src={InspetorLogoPNG}
      alt="Inspetor Industrial"
      className={cn('size-4 object-cover', className)}
      width={1920}
      height={1080}
      {...props}
    />
  )
}
