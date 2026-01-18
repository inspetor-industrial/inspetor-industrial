'use client'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { Toaster } from '@inspetor/components/ui/sonner'
import { MantineProvider } from '@mantine/core'
import { SessionProvider } from 'next-auth/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'

type ProviderProps = {
  children: ReactNode | ReactNode[]
}

export function Providers({ children }: ProviderProps) {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AntdRegistry>
      <ProgressProvider
        height="8px"
        color="#0969da"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <SessionProvider>
          <MantineProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </MantineProvider>
          <Toaster richColors />
        </SessionProvider>
      </ProgressProvider>
    </AntdRegistry>
    // </ThemeProvider>
  )
}
