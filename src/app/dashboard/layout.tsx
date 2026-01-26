import { AppSidebar } from '@inspetor/components/app-sidebar'
import { Header } from '@inspetor/components/header'
import { InspetorLoading } from '@inspetor/components/inspetor-loading'
import { MainContainer } from '@inspetor/components/main-container'
import { SidebarProvider } from '@inspetor/components/ui/sidebar'
import { auth } from '@inspetor/lib/auth/authjs'
import {
  disableBoilerReportFlag,
  disableEquipmentsFlag,
} from '@inspetor/lib/flags'
import { Suspense } from 'react'

import { AuthWrapper } from './components/auth-wrapper'
import { PermissionWrapper } from './components/permission-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  let isDisableEquipments = await disableEquipmentsFlag()
  let isDisableBoilerReport = await disableBoilerReportFlag()

  if (process.env.NODE_ENV === 'development') {
    isDisableEquipments = false
    isDisableBoilerReport = false
  }

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
            <AppSidebar
              user={session?.user}
              flags={{
                disableEquipments: isDisableEquipments,
                disableBoilerReport: isDisableBoilerReport,
              }}
            />
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
