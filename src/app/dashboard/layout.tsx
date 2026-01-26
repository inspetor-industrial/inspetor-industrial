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
  const isDisableEquipments = await disableEquipmentsFlag()
  const isDisableBoilerReport = await disableBoilerReportFlag()

  console.log('flags', {
    isDisableEquipments,
    isDisableBoilerReport,
  })

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
