import {
  BoilerReportWithRelations,
  getBoilerReportByIdAction,
} from '@inspetor/actions/boiler/get-boiler-report-by-id'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { formSteps } from '@inspetor/constants/form-steps-boiler-report'
import { UserResponsibility } from '@inspetor/generated/prisma/client'
import { getFullAuthenticatedUser } from '@inspetor/lib/auth/get-full-user'
import { getSession } from '@inspetor/lib/auth/server'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { disableBoilerReportFormsFlag } from '@inspetor/lib/flags'
import { prisma } from '@inspetor/lib/prisma'
import {
  Beaker,
  Box,
  Clipboard,
  Construction,
  Cpu,
  Droplets,
  FileCheck,
  FileCog,
  FileText,
  Flame,
  FlaskConical,
  FlaskRound,
  Gauge,
  Package,
  Radio,
  Sparkles,
  Syringe,
  TestTube,
  TestTube2,
  TrendingUp,
  User,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import { FileText } from 'lucide-react'
import { redirect } from 'next/navigation'

import { BoilerReportTypeBadge } from '../../components/boiler-report-type-badge'
import { BoilerSectionCard } from '../components/boiler-section-card'
import { BoilerReportActions } from './components/boiler-report-actions'

type BoilerViewPageProps = {
  params: Promise<{
    boilerId: string
  }>
}

export default async function BoilerViewPage({ params }: BoilerViewPageProps) {
  const { boilerId } = await params

  const session = await getSession()
  const fullUser = await getFullAuthenticatedUser(session)
  if (!fullUser) {
    redirect('/auth/sign-in')
  }

  const [boilerReportResponse] = await getBoilerReportByIdAction({
    boilerReportId: boilerId,
  })

  const boilerReport = boilerReportResponse.others
    .data as BoilerReportWithRelations

  if (!boilerReportResponse.success || !boilerReportResponse.others?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Relatório não encontrado ou você não tem permissão para
              visualizá-lo
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clients = await prisma.clients.findMany({
    where: {
      companyId: fullUser.companyId,
    },
  })

  const engineers = await prisma.user.findMany({
    where: {
      companyId: fullUser.companyId,
      responsibility: UserResponsibility.ENGINEER,
    },
  })

  let isDisableBoilerReportForms = await disableBoilerReportFormsFlag()
  if (process.env.NODE_ENV === 'development') {
    isDisableBoilerReportForms = false
  }

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <Card className="border-2">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center gap-2 sm:gap-3">
              <FileText className="size-5 sm:size-6 lg:size-7 text-inspetor-dark-blue-700 shrink-0" />
              <span className="leading-tight">
                Relatório de Inspeção de Caldeira
              </span>
            </CardTitle>
            <BoilerReportActions
              boilerReport={boilerReport}
              clients={clients}
              engineers={engineers}
            />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cliente:</p>
            <p className="font-medium">{boilerReport.client.companyName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tipo:</p>
            <BoilerReportTypeBadge type={boilerReport.type} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data:</p>
            <p className="font-medium">
              {boilerReport.date
                ? dayjsApi(boilerReport.date).format('DD/MM/YYYY')
                : 'Não informado'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Próxima Inspeção:</p>
            <p className="font-medium">
              {boilerReport.nextInspectionDate
                ? dayjsApi(boilerReport.nextInspectionDate).format('DD/MM/YYYY')
                : 'Não informado'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Engenheiro:</p>
            <p className="font-medium">{boilerReport.engineer.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Criado em:</p>
            <p className="font-medium">
              {boilerReport.createdAt
                ? dayjsApi(boilerReport.createdAt).format('DD/MM/YYYY HH:mm')
                : 'Não informado'}
            </p>
          </div>
        </CardContent>
      </Card>

      {isDisableBoilerReportForms ? (
        <Card className="border-2 border-dashed border-inspetor-dark-blue-700/30 bg-linear-to-b from-muted/40 to-muted/20 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 sm:py-20">
            <div
              className="relative flex size-20 items-center justify-center rounded-2xl bg-inspetor-dark-blue-700/10 text-inspetor-dark-blue-700 ring-2 ring-inspetor-dark-blue-700/20 sm:size-24"
              aria-hidden
            >
              <Construction className="size-10 sm:size-12" strokeWidth={1.5} />
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Em breve
            </h2>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground sm:text-base">
              Os formulários de preenchimento das seções do relatório estarão
              disponíveis em breve. Você já pode visualizar e editar as
              informações gerais acima.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">
                Relatório somente leitura
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subSections.map((section) => (
            <BoilerSectionCard
              boilerId={boilerId}
              key={section.id}
              section={section}
            />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {formSteps.map((section) => (
          <BoilerSectionCard
            boilerId={boilerId}
            key={section.id}
            section={section}
          />
        ))}
      </div>
    </div>
  )
}
