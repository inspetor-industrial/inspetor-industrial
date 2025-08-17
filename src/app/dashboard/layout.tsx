import { AppSidebar } from '@inspetor/components/app-sidebar'
import { Header } from '@inspetor/components/header'
import { InspetorLoading } from '@inspetor/components/inspetor-loading'
import { MainContainer } from '@inspetor/components/main-container'
import { SidebarProvider } from '@inspetor/components/ui/sidebar'
import { auth } from '@inspetor/lib/auth/authjs'
import { Suspense } from 'react'

import { AuthWrapper } from './components/auth-wrapper'
import { PermissionWrapper } from './components/permission-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <InspetorLoading />
        </div>
      }
    >
      <AuthWrapper>
        <PermissionWrapper>
          <SidebarProvider>
            <AppSidebar user={session?.user} />
            <div className="flex flex-col flex-1 @container">
              <Header />
              <MainContainer>{children}</MainContainer>
            </div>
          </SidebarProvider>
        </PermissionWrapper>
      </AuthWrapper>
    </Suspense>
  )
}
