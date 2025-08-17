import { cn } from '@inspetor/lib/utils'
import Image from 'next/image'
import type { ComponentProps } from 'react'

import WavesPNG from './raw/waves.png'

export type WavesProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'>

export function Waves({ className, ...props }: WavesProps) {
  return (
    <Image
      src={WavesPNG}
      alt="Waves"
      className={cn('size-4 object-cover', className)}
      width={1920}
      height={1080}
      {...props}
    />
  )
}
