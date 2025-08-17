import { cn } from '@inspetor/lib/utils'
import Image from 'next/image'
import type { ComponentProps } from 'react'

import AuthBgPNG from './raw/application-background.png'

type AuthBgProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'>

export function AuthBg({ className, ...props }: AuthBgProps) {
  return (
    <Image
      src={AuthBgPNG}
      alt="Inspetor Industrial App - Auth background"
      className={cn('object-cover', className)}
      width={1920}
      height={1080}
      {...props}
    />
  )
}
